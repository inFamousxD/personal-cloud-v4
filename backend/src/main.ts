import express, { Request, Response } from 'express';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import notesRouter from './routes/notes.js';
import { client, connectDB } from './db.js';

dotenv.config();

const app = express();
const PORT = 3333;

// CORS middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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


process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});