import express, { Request, Response } from 'express';
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
import { client, connectDB } from './db.js';

dotenv.config();

const app = express();
const PORT = 3333;

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

// Mount routes
app.use('/api/notes', notesRouter);
app.use('/api/journals', journalsRouter);
app.use('/api/lists', listsRouter);
app.use('/api/server', serverRouter);
app.use('/api/whisper', whisperRouter);
app.use('/api/trackers', trackersRouter);
app.use('/api/agent', agentRouter);

process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

// For Vercel serverless deployment
if (process.env.VERCEL) {
    connectDB();
} else {
    // For local development
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
}

// Export for Vercel
export default app;