import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import axios from 'axios';

const router = Router();
router.use(authenticateToken);

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// POST /api/agent/chat
router.post('/chat', async (req: AuthRequest, res: Response) => {
    try {
        const { model = 'llama3.2', messages, stream = true } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array required' });
        }

        const response = await axios.post(
            `${OLLAMA_URL}/api/chat`,
            {
                model,
                messages,
                stream
            },
            {
                responseType: stream ? 'stream' : 'json',
                timeout: 120000
            }
        );

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            let fullText = '';

            response.data.on('data', (chunk: Buffer) => {
                const lines = chunk.toString().split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);
                        if (json.message?.content) {
                            fullText += json.message.content;
                            // Send accumulated text
                            res.write(JSON.stringify({ 
                                message: { content: fullText },
                                done: json.done 
                            }) + '\n');
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            });

            response.data.on('end', () => {
                res.end();
            });

            response.data.on('error', (error: Error) => {
                console.error('Stream error:', error);
                res.end();
            });
        } else {
            res.json(response.data);
        }
    } catch (error: any) {
        console.error('Agent chat error:', error);
        
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