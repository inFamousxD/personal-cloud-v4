import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import axios, { CancelTokenSource } from 'axios';
import { 
    AgentChat, 
    AgentMessage,
    AgentSettings,
    CreateChatInput,
    UpdateChatInput
} from '../models/Agent.js';

const router = Router();
router.use(authenticateToken);

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant. Be concise but thorough in your responses.";

// Store active cancel tokens for stream abortion
const activeStreams = new Map<string, CancelTokenSource>();

// Track active sessions (in-memory, could be moved to Redis for production)
const activeSessions = new Map<string, { chatId: string; startTime: Date }>();

// ===== SETTINGS ROUTES =====

// GET /api/agent/settings - Get user's agent settings
router.get('/settings', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let settings = await db.collection<AgentSettings>('agent_settings').findOne({ userId });
        
        if (!settings) {
            // Create default settings
            const newSettings: AgentSettings = {
                userId,
                defaultSystemPrompt: DEFAULT_SYSTEM_PROMPT,
                updatedAt: new Date()
            };
            const result = await db.collection<AgentSettings>('agent_settings').insertOne(newSettings);
            settings = {
                ...newSettings,
                _id: result.insertedId
            };
        }

        res.json(settings);
    } catch (error: any) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

// PUT /api/agent/settings - Update user's agent settings
router.put('/settings', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { defaultSystemPrompt } = req.body;

        if (!defaultSystemPrompt || typeof defaultSystemPrompt !== 'string') {
            return res.status(400).json({ error: 'Invalid system prompt' });
        }

        const result = await db.collection<AgentSettings>('agent_settings').findOneAndUpdate(
            { userId },
            { 
                $set: { 
                    defaultSystemPrompt,
                    updatedAt: new Date()
                },
                $setOnInsert: { userId }
            },
            { 
                upsert: true,
                returnDocument: 'after' 
            }
        );

        if (!result) {
            return res.status(500).json({ error: 'Failed to update settings' });
        }

        res.json(result);
    } catch (error: any) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// ===== CHAT ROUTES =====

// GET /api/agent/active-sessions - Get count of active sessions
router.get('/active-sessions', async (_req: AuthRequest, res: Response) => {
    try {
        const now = new Date().getTime();
        // Clean up stale sessions (older than 5 minutes)
        for (const [userId, session] of activeSessions.entries()) {
            if (now - session.startTime.getTime() > 5 * 60 * 1000) {
                activeSessions.delete(userId);
            }
        }

        res.json({ 
            count: activeSessions.size,
            hasSessions: activeSessions.size > 0
        });
    } catch (error: any) {
        console.error('Active sessions error:', error);
        res.status(500).json({ error: 'Failed to get active sessions' });
    }
});

// Helper function to generate chat title using AI
async function generateChatTitle(messages: { role: string; content: string }[], model: string): Promise<string> {
    try {
        const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
        
        const titlePrompt = {
            model,
            messages: [
                {
                    role: 'system',
                    content: 'Generate a concise 3-6 word title for this conversation. Return ONLY the title, no quotes or extra text.'
                },
                {
                    role: 'user',
                    content: `User message: "${firstUserMessage.slice(0, 200)}"`
                }
            ],
            stream: false
        };

        const response = await axios.post(
            `${OLLAMA_URL}/api/chat`,
            titlePrompt,
            { timeout: 10000 }
        );

        const generatedTitle = response.data.message?.content?.trim() || '';
        
        // Clean up the title (remove quotes, limit length)
        const cleanTitle = generatedTitle
            .replace(/^["']|["']$/g, '')
            .slice(0, 50);
        
        return cleanTitle || firstUserMessage.slice(0, 50);
    } catch (error) {
        console.error('Title generation error:', error);
        // Fallback to first message
        const firstUserMessage = messages.find(m => m.role === 'user')?.content || 'New Chat';
        return firstUserMessage.slice(0, 50);
    }
}

// POST /api/agent/chat - Send message and stream response
router.post('/chat', async (req: AuthRequest, res: Response) => {
    try {
        const { 
            model = 'gemma3:4b', 
            messages, 
            chatId, 
            contextLimit = 20,
            enableThinking = false
        } = req.body;
        const userId = req.userId;

        // console.log('=== CHAT REQUEST START ===');
        // console.log('Model:', model);
        // console.log('EnableThinking:', enableThinking);
        // console.log('ChatId:', chatId);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array required' });
        }

        // Mark session as active
        activeSessions.set(userId, { chatId: chatId || 'new', startTime: new Date() });

        let currentChatId = chatId;
        let systemPrompt = DEFAULT_SYSTEM_PROMPT;
        
        // Get user's default system prompt
        const settings = await db.collection<AgentSettings>('agent_settings').findOne({ userId });
        if (settings?.defaultSystemPrompt) {
            systemPrompt = settings.defaultSystemPrompt;
        }
        
        // Create new chat if not provided
        if (!currentChatId) {
            const title = await generateChatTitle(messages, model);
            const now = new Date();
            const newChat: AgentChat = {
                userId,
                title: title.length === 50 ? title + '...' : title,
                systemPrompt,
                createdAt: now,
                updatedAt: now
            };
            const result = await db.collection<AgentChat>('agent_chats').insertOne(newChat);
            currentChatId = result.insertedId.toString();
        } else {
            if (!ObjectId.isValid(currentChatId)) {
                activeSessions.delete(userId);
                return res.status(400).json({ error: 'Invalid chat ID' });
            }

            const chat = await db.collection<AgentChat>('agent_chats').findOne({
                _id: new ObjectId(currentChatId),
                userId
            });

            if (!chat) {
                activeSessions.delete(userId);
                return res.status(404).json({ error: 'Chat not found' });
            }

            if (chat.systemPrompt) {
                systemPrompt = chat.systemPrompt;
            }
        }

        // Save user message
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

        // Prepend system message
        const messagesWithSystem = [
            { role: 'system', content: systemPrompt },
            ...conversationMessages
        ];

        // Create cancel token for this stream
        const cancelTokenSource = axios.CancelToken.source();
        const streamId = currentChatId + '-' + Date.now();
        activeStreams.set(streamId, cancelTokenSource);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Chat-Id', currentChatId);
        res.setHeader('X-Stream-Id', streamId);

        // Prepare Ollama request
        const ollamaRequest = {
            model,
            messages: messagesWithSystem,
            stream: true,
            ...(enableThinking && { think: true }) // Only add if enabled
        };

        // console.log('=== OLLAMA REQUEST ===');
        // console.log('URL:', `${OLLAMA_URL}/api/chat`);
        // console.log('Model:', ollamaRequest.model);
        // console.log('Think:', ollamaRequest.think);
        // console.log('Messages count:', ollamaRequest.messages.length);

        const response = await axios.post(
            `${OLLAMA_URL}/api/chat`,
            ollamaRequest,
            {
                responseType: 'stream',
                timeout: 120000,
                cancelToken: cancelTokenSource.token
            }
        );

        // console.log('=== OLLAMA RESPONSE STARTED ===');

        let fullText = '';
        let fullThinking = '';
        let isComplete = false;
        let chunkCount = 0;

        response.data.on('data', (chunk: Buffer) => {
            const lines = chunk.toString().split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    chunkCount++;
                    
                    // LOG EVERY CHUNK FROM OLLAMA
                    if (chunkCount <= 5 || json.message?.thinking || json.done) {
                        // console.log(`=== CHUNK #${chunkCount} ===`);
                        // console.log('Has thinking:', !!json.message?.thinking);
                        // console.log('Has content:', !!json.message?.content);
                        // console.log('Done:', json.done);
                        if (json.message?.thinking) {
                            // console.log('Thinking preview:', json.message.thinking.substring(0, 50) + '...');
                        }
                        if (json.message?.content) {
                            // console.log('Content preview:', json.message.content.substring(0, 50) + '...');
                        }
                    }
                    
                    // Handle thinking from Ollama
                    if (json.message?.thinking) {
                        fullThinking += json.message.thinking;
                        // console.log(`=== SENDING THINKING TO CLIENT (length: ${fullThinking.length}) ===`);
                        
                        const payload = { 
                            thinking: { content: fullThinking },
                            message: { content: fullText },
                            done: false,
                            chatId: currentChatId
                        };
                        // console.log('Payload thinking length:', payload.thinking.content.length);
                        res.write(JSON.stringify(payload) + '\n');
                    }
                    
                    // Handle content
                    if (json.message?.content) {
                        fullText += json.message.content;
                        // console.log(`=== SENDING CONTENT TO CLIENT (length: ${fullText.length}) ===`);
                        
                        const payload = { 
                            thinking: fullThinking ? { content: fullThinking } : undefined,
                            message: { content: fullText },
                            done: json.done,
                            chatId: currentChatId
                        };
                        if (fullThinking) {
                            // console.log('Payload includes thinking, length:', payload.thinking?.content.length);
                        }
                        res.write(JSON.stringify(payload) + '\n');
                    }
                    
                    if (json.done) {
                        isComplete = true;
                        // console.log('=== STREAM COMPLETE ===');
                        // console.log('Final thinking length:', fullThinking.length);
                        // console.log('Final content length:', fullText.length);
                    }
                } catch (e) {
                    console.error('Failed to parse Ollama chunk:', e);
                }
            }
        });

        response.data.on('end', async () => {
            // console.log('=== RESPONSE END ===');
            // console.log('Saving to DB - Thinking length:', fullThinking.length);
            // console.log('Saving to DB - Content length:', fullText.length);
            
            if (fullText || fullThinking) {
                const assistantMessage: AgentMessage = {
                    chatId: currentChatId!,
                    role: 'assistant',
                    content: fullText,
                    ...(fullThinking && { thinking: fullThinking }),
                    timestamp: new Date()
                };
                await db.collection<AgentMessage>('agent_messages').insertOne(assistantMessage);
                await db.collection<AgentChat>('agent_chats').updateOne(
                    { _id: new ObjectId(currentChatId) },
                    { $set: { updatedAt: new Date() } }
                );
            }

            activeStreams.delete(streamId);
            activeSessions.delete(userId);
            res.end();
        });

        response.data.on('error', async (error: Error) => {
            console.error('=== STREAM ERROR ===', error);
            
            if (fullText || fullThinking) {
                const assistantMessage: AgentMessage = {
                    chatId: currentChatId!,
                    role: 'assistant',
                    content: fullText + '\n\n[Stream interrupted]',
                    ...(fullThinking && { thinking: fullThinking }),
                    timestamp: new Date()
                };
                await db.collection<AgentMessage>('agent_messages').insertOne(assistantMessage);
            }
            
            activeStreams.delete(streamId);
            activeSessions.delete(userId);
            res.end();
        });

        req.on('close', async () => {
            console.log('=== CLIENT DISCONNECT ===');
            if (!isComplete && (fullText || fullThinking)) {
                const assistantMessage: AgentMessage = {
                    chatId: currentChatId!,
                    role: 'assistant',
                    content: fullText,
                    ...(fullThinking && { thinking: fullThinking }),
                    timestamp: new Date()
                };
                await db.collection<AgentMessage>('agent_messages').insertOne(assistantMessage);
                
                await db.collection<AgentChat>('agent_chats').updateOne(
                    { _id: new ObjectId(currentChatId) },
                    { $set: { updatedAt: new Date() } }
                );
            }
            activeStreams.delete(streamId);
            activeSessions.delete(userId);
        });

    } catch (error: any) {
        console.error('=== AGENT CHAT ERROR ===', error);
        
        if (req.userId) {
            activeSessions.delete(req.userId);
        }
        
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

// POST /api/agent/generate-note - Generate note from transcription
router.post('/generate-note', async (req: AuthRequest, res: Response) => {
    try {
        const { transcription, model = 'gemma3:4b' } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!transcription || typeof transcription !== 'string') {
            return res.status(400).json({ error: 'Transcription required' });
        }

        const notePrompt = {
            model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a note-taking assistant. Convert the voice transcription into a concise, well-formatted note. Return ONLY the note content, no extra commentary.'
                },
                {
                    role: 'user',
                    content: `Transcription: "${transcription}"`
                }
            ],
            stream: false
        };

        const titlePrompt = {
            model,
            messages: [
                {
                    role: 'system',
                    content: 'Generate a concise 3-6 word title for this note. Return ONLY the title, no quotes or extra text.'
                },
                {
                    role: 'user',
                    content: `Note content: "${transcription.slice(0, 200)}"`
                }
            ],
            stream: false
        };

        // Generate note content and title in parallel
        const [noteResponse, titleResponse] = await Promise.all([
            axios.post(`${OLLAMA_URL}/api/chat`, notePrompt, { timeout: 30000 }),
            axios.post(`${OLLAMA_URL}/api/chat`, titlePrompt, { timeout: 10000 })
        ]);

        const content = noteResponse.data.message?.content?.trim() || transcription;
        const title = titleResponse.data.message?.content?.trim()
            .replace(/^["']|["']$/g, '')
            .slice(0, 50) || 'Voice Note';

        res.json({ title, content });
    } catch (error: any) {
        console.error('Generate note error:', error);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: 'AI service unavailable',
                fallback: true
            });
        }
        
        res.status(500).json({ error: 'Failed to generate note' });
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
            
            if (req.userId) {
                activeSessions.delete(req.userId);
            }
            
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

        // Get user's default system prompt
        let systemPrompt = DEFAULT_SYSTEM_PROMPT;
        const settings = await db.collection<AgentSettings>('agent_settings').findOne({ userId });
        if (settings?.defaultSystemPrompt) {
            systemPrompt = settings.defaultSystemPrompt;
        }

        const now = new Date();
        const newChat: AgentChat = {
            userId,
            title: 'New Chat',
            systemPrompt,
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

// PATCH /api/agent/chats/:id - Update chat
router.patch('/chats/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const chatId = req.params.id;
        const { title, systemPrompt }: UpdateChatInput = req.body;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!ObjectId.isValid(chatId)) {
            return res.status(400).json({ error: 'Invalid chat ID' });
        }

        if (!title && !systemPrompt) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const updateData: Partial<AgentChat> = { updatedAt: new Date() };
        if (title) updateData.title = title.trim();
        if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;

        const result = await db.collection<AgentChat>('agent_chats').findOneAndUpdate(
            { 
                _id: new ObjectId(chatId),
                userId 
            },
            { $set: updateData },
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

// GET /api/agent/models/:name/info - Get detailed model information
router.get('/models/:name/info', async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.params;
        
        const response = await axios.post(
            `${OLLAMA_URL}/api/show`,
            { name },
            { timeout: 5000 }
        );
        
        // Extract capabilities from modelfile or template
        const modelInfo = response.data;
        
        // Check if model supports thinking by looking at the template or parameters
        // Models like deepseek-r1, qwq, qwen2.5 support thinking
        const supportsThinking = 
            modelInfo.template?.includes('thinking') ||
            modelInfo.parameters?.includes('think') ||
            name.toLowerCase().includes('deepseek') ||
            name.toLowerCase().includes('qwq') ||
            name.toLowerCase().includes('qwen');
        
        res.json({
            ...modelInfo,
            capabilities: {
                thinking: supportsThinking
            }
        });
    } catch (error: any) {
        console.error('Get model info error:', error);
        res.status(500).json({ 
            error: 'Failed to get model info',
            capabilities: {
                thinking: false
            }
        });
    }
});

export default router;