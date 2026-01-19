import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import notesRouter from './routes/notes.js';
import journalsRouter from './routes/journals.js';
import listsRouter from './routes/lists.js';
import serverRouter from './routes/server.js';
import whisperRouter from './routes/whisper.js';
import trackersRouter from './routes/trackers.js';
import agentRouter from './routes/agent.js';
import adminRouter from './routes/admin.js';
import terminalRouter, { initTerminalWebSocket } from './routes/terminal.js';
import { client, connectDB } from './db.js';
import { authenticateToken } from './middleware/auth.js';
import { requireFeature } from './middleware/permissions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Create HTTP server for both Express and WebSocket
const server = createServer(app);

// CORS middleware
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.get('/', (_req: Request, res: Response) => {
    res.send('hello');
});

app.post('/post-test', (req: Request, res: Response) => {
    const data = req.body;
    console.log(data);
    writeFileSync('test.txt', data.test);

    res.send(200);
});

// Mount routes - all features check permissions
// Note: authenticateToken is already applied inside each router, 
// but we add requireFeature for permission checking
app.use('/api/notes', authenticateToken, requireFeature('notes'), notesRouter);
app.use('/api/journals', authenticateToken, requireFeature('journal'), journalsRouter);
app.use('/api/lists', authenticateToken, requireFeature('lists'), listsRouter);
app.use('/api/trackers', authenticateToken, requireFeature('tracker'), trackersRouter);
app.use('/api/whisper', authenticateToken, whisperRouter); // Utility, no feature gate

// Restricted features (denied by default)
app.use('/api/server', authenticateToken, requireFeature('server'), serverRouter);
app.use('/api/agent', authenticateToken, requireFeature('agent'), agentRouter);
app.use('/api/terminal', authenticateToken, requireFeature('terminal'), terminalRouter);

// Admin routes
app.use('/api/admin', adminRouter);

process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

// For Vercel serverless deployment (WebSocket won't work)
if (process.env.VERCEL) {
    connectDB();
} else {
    // For local/server development - with WebSocket support
    connectDB().then(() => {
        // Initialize WebSocket server for terminal
        initTerminalWebSocket(server);
        
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`WebSocket terminal available at ws://localhost:${PORT}/ws/terminal`);
        });
    });
}

// Export for Vercel
export default app;