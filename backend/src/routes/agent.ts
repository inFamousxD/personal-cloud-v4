import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import axios, { CancelTokenSource } from 'axios';
import { 
    AgentChat, 
    AgentMessage,
    CreateChatInput,
    UpdateChatInput
} from '../models/Agent.js';

const router = Router();
router.use(authenticateToken);

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Store active cancel tokens for stream abortion
const activeStreams = new Map<string, CancelTokenSource>();

// ===== CHAT ROUTES =====

// POST /api/agent/chat - Send message and stream response
router.post('/chat', async (req: AuthRequest, res: Response) => {
    try {
        const { model = 'gemma3:4b', messages, chatId, contextLimit = 20 } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array required' });
        }

        let currentChatId = chatId;
        
        // Create new chat if not provided
        if (!currentChatId) {
            const firstUserMessage = messages.find(m => m.role === 'user');
            const title = firstUserMessage?.content.slice(0, 50) || 'New Chat';
            
            const now = new Date();
            const newChat: AgentChat = {
                userId,
                title: title.length === 50 ? title + '...' : title,
                createdAt: now,
                updatedAt: now
            };

            const result = await db.collection<AgentChat>('agent_chats').insertOne(newChat);
            currentChatId = result.insertedId.toString();
        } else {
            // Validate chatId exists and belongs to user
            if (!ObjectId.isValid(currentChatId)) {
                return res.status(400).json({ error: 'Invalid chat ID' });
            }

            const chat = await db.collection<AgentChat>('agent_chats').findOne({
                _id: new ObjectId(currentChatId),
                userId
            });

            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
        }

        // Save user message (last message in array)
        const userMessage = messages[messages.length - 1];
        if (userMessage.role === 'user') {
            const newMessage: AgentMessage = {
                chatId: currentChatId,
                role: 'user',
                content: userMessage.content,
                timestamp: new Date()
            };
            await db.collection<AgentMessage>('agent_messages').insertOne(newMessage);
        }

        // Load context from database if needed
        let conversationMessages = messages;
        if (chatId) {
            const dbMessages = await db.collection<AgentMessage>('agent_messages')
                .find({ chatId })
                .sort({ timestamp: 1 })
                .limit(contextLimit)
                .toArray();
            
            conversationMessages = dbMessages.map(m => ({
                role: m.role,
                content: m.content
            }));
        }

        // Create cancel token for this stream
        const cancelTokenSource = axios.CancelToken.source();
        const streamId = currentChatId + '-' + Date.now();
        activeStreams.set(streamId, cancelTokenSource);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Chat-Id', currentChatId);
        res.setHeader('X-Stream-Id', streamId);

        const response = await axios.post(
            `${OLLAMA_URL}/api/chat`,
            {
                model,
                messages: conversationMessages,
                stream: true
            },
            {
                responseType: 'stream',
                timeout: 120000,
                cancelToken: cancelTokenSource.token
            }
        );

        let fullText = '';
        let isComplete = false;

        response.data.on('data', (chunk: Buffer) => {
            const lines = chunk.toString().split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                        fullText += json.message.content;
                        res.write(JSON.stringify({ 
                            message: { content: fullText },
                            done: json.done,
                            chatId: currentChatId
                        }) + '\n');
                    }
                    if (json.done) {
                        isComplete = true;
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        });

        response.data.on('end', async () => {
            // Save assistant message
            if (fullText) {
                const assistantMessage: AgentMessage = {
                    chatId: currentChatId!,
                    role: 'assistant',
                    content: fullText,
                    timestamp: new Date()
                };
                await db.collection<AgentMessage>('agent_messages').insertOne(assistantMessage);

                // Update chat timestamp
                await db.collection<AgentChat>('agent_chats').updateOne(
                    { _id: new ObjectId(currentChatId) },
                    { $set: { updatedAt: new Date() } }
                );
            }

            activeStreams.delete(streamId);
            res.end();
        });

        response.data.on('error', async (error: Error) => {
            console.error('Stream error:', error);
            
            // Save partial response if any
            if (fullText) {
                const assistantMessage: AgentMessage = {
                    chatId: currentChatId!,
                    role: 'assistant',
                    content: fullText + '\n\n[Stream interrupted]',
                    timestamp: new Date()
                };
                await db.collection<AgentMessage>('agent_messages').insertOne(assistantMessage);
            }
            
            activeStreams.delete(streamId);
            res.end();
        });

        // Handle client disconnect
        req.on('close', async () => {
            if (!isComplete && fullText) {
                const assistantMessage: AgentMessage = {
                    chatId: currentChatId!,
                    role: 'assistant',
                    content: fullText,
                    timestamp: new Date()
                };
                await db.collection<AgentMessage>('agent_messages').insertOne(assistantMessage);
                
                await db.collection<AgentChat>('agent_chats').updateOne(
                    { _id: new ObjectId(currentChatId) },
                    { $set: { updatedAt: new Date() } }
                );
            }
            activeStreams.delete(streamId);
        });

    } catch (error: any) {
        console.error('Agent chat error:', error);
        
        if (axios.isCancel(error)) {
            return res.status(499).json({ error: 'Request cancelled' });
        }
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: 'Ollama service unavailable' 
            });
        }
        
        res.status(500).json({ 
            error: 'Chat failed',
            message: error.message 
        });
    }
});

// POST /api/agent/chat/stop - Stop active stream
router.post('/chat/stop', async (req: AuthRequest, res: Response) => {
    try {
        const { streamId } = req.body;
        
        if (!streamId) {
            return res.status(400).json({ error: 'Stream ID required' });
        }

        const cancelToken = activeStreams.get(streamId);
        if (cancelToken) {
            cancelToken.cancel('User requested stop');
            activeStreams.delete(streamId);
            return res.json({ success: true });
        }

        res.status(404).json({ error: 'Stream not found' });
    } catch (error: any) {
        console.error('Stop stream error:', error);
        res.status(500).json({ error: 'Failed to stop stream' });
    }
});

// GET /api/agent/chats - Get all chats for user
router.get('/chats', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const chats = await db.collection<AgentChat>('agent_chats')
            .find({ userId })
            .sort({ updatedAt: -1 })
            .toArray();

        res.json(chats);
    } catch (error: any) {
        console.error('Get chats error:', error);
        res.status(500).json({ error: 'Failed to get chats' });
    }
});

// GET /api/agent/chats/:id - Get chat with messages
router.get('/chats/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const chatId = req.params.id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!ObjectId.isValid(chatId)) {
            return res.status(400).json({ error: 'Invalid chat ID' });
        }

        const chat = await db.collection<AgentChat>('agent_chats').findOne({
            _id: new ObjectId(chatId),
            userId
        });
        
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const messages = await db.collection<AgentMessage>('agent_messages')
            .find({ chatId })
            .sort({ timestamp: 1 })
            .toArray();

        res.json({ chat, messages });
    } catch (error: any) {
        console.error('Get chat error:', error);
        res.status(500).json({ error: 'Failed to get chat' });
    }
});

// POST /api/agent/chats - Create new chat
router.post('/chats', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const now = new Date();
        const newChat: AgentChat = {
            userId,
            title: 'New Chat',
            createdAt: now,
            updatedAt: now
        };

        const result = await db.collection<AgentChat>('agent_chats').insertOne(newChat);

        res.status(201).json({
            _id: result.insertedId,
            ...newChat
        });
    } catch (error: any) {
        console.error('Create chat error:', error);
        res.status(500).json({ error: 'Failed to create chat' });
    }
});

// DELETE /api/agent/chats/:id - Delete chat and messages
router.delete('/chats/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const chatId = req.params.id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!ObjectId.isValid(chatId)) {
            return res.status(400).json({ error: 'Invalid chat ID' });
        }

        const chat = await db.collection<AgentChat>('agent_chats').findOne({
            _id: new ObjectId(chatId),
            userId
        });
        
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Delete all messages
        await db.collection<AgentMessage>('agent_messages').deleteMany({ chatId });
        
        // Delete chat
        await db.collection<AgentChat>('agent_chats').deleteOne({
            _id: new ObjectId(chatId)
        });

        res.json({ message: 'Chat deleted successfully' });
    } catch (error: any) {
        console.error('Delete chat error:', error);
        res.status(500).json({ error: 'Failed to delete chat' });
    }
});

// PATCH /api/agent/chats/:id - Update chat title
router.patch('/chats/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const chatId = req.params.id;
        const { title }: UpdateChatInput = req.body;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!ObjectId.isValid(chatId)) {
            return res.status(400).json({ error: 'Invalid chat ID' });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title required' });
        }

        const result = await db.collection<AgentChat>('agent_chats').findOneAndUpdate(
            { 
                _id: new ObjectId(chatId),
                userId 
            },
            { 
                $set: { 
                    title: title.trim(),
                    updatedAt: new Date()
                } 
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        res.json(result);
    } catch (error: any) {
        console.error('Update chat error:', error);
        res.status(500).json({ error: 'Failed to update chat' });
    }
});

// ===== SYSTEM ROUTES =====

// GET /api/agent/models
router.get('/models', async (_req: AuthRequest, res: Response) => {
    try {
        const response = await axios.get(`${OLLAMA_URL}/api/tags`, {
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ 
            error: 'Ollama service unavailable' 
        });
    }
});

// GET /api/agent/health
router.get('/health', async (_req: AuthRequest, res: Response) => {
    try {
        await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
        res.json({ status: 'healthy' });
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy',
            error: 'Ollama service unavailable' 
        });
    }
});

export default router;