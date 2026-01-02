import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

const WHISPER_URL = process.env.WHISPER_SERVICE_URL || 'http://localhost:8001';

// POST /api/whisper/transcribe
router.post('/transcribe', upload.single('audio'), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Forward to Whisper service
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: 'audio.webm',
            contentType: req.file.mimetype
        });

        const response = await axios.post(`${WHISPER_URL}/transcribe`, formData, {
            headers: formData.getHeaders(),
            timeout: 30000 // 30 seconds
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Transcription error:', error);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: 'Whisper service unavailable' 
            });
        }
        
        res.status(500).json({ 
            error: 'Transcription failed',
            message: error.message 
        });
    }
});

// GET /api/whisper/health
router.get('/health', async (_req: AuthRequest, res: Response) => {
    try {
        const response = await axios.get(`${WHISPER_URL}/health`, {
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy',
            error: 'Whisper service unavailable' 
        });
    }
});

export default router;