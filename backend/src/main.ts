import express, { Request, Response } from 'express';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import notesRouter from './routes/notes.js';
import journalsRouter from './routes/journals.js';
import listsRouter from './routes/lists.js';
import serverRouter from './routes/server.js';
import { client, connectDB } from './db.js';

dotenv.config();

const app = express();
const PORT = 3333;

// CORS middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL_DEV, process.env.FRONTEND_URL_PROD],
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

// Mount notes routes
app.use('/api/notes', notesRouter);

// Mount journals routes
app.use('/api/journals', journalsRouter);

// Mount lists routes
app.use('/api/lists', listsRouter);

// Mount server routes
app.use('/api/server', serverRouter);


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
