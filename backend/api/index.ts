import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import notesRouter from '../src/routes/notes.js';
import journalsRouter from '../src/routes/journals.js';
import listsRouter from '../src/routes/lists.js';
import serverRouter from '../src/routes/server.js';
import { connectDB } from '../src/db.js';

dotenv.config();

const app = express();

// CORS middleware
app.use(cors({
    origin: true, // Allow all origins for now, restrict later
    credentials: true,
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'API is running', status: 'ok' });
});

app.get('/api', (_req: Request, res: Response) => {
    res.json({ message: 'API routes are working', status: 'ok' });
});

// Mount routes
app.use('/api/notes', notesRouter);
app.use('/api/journals', journalsRouter);
app.use('/api/lists', listsRouter);
app.use('/api/server', serverRouter);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: any) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// Initialize database connection
let dbConnected = false;

async function initDB() {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
            console.log('Database connected');
        } catch (error) {
            console.error('Database connection error:', error);
        }
    }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
    await initDB();
    return app(req, res);
}