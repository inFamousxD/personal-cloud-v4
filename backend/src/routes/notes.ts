import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { Note, CreateNoteInput, UpdateNoteInput } from '../models/Note.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET all notes for the authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const notes = await db
            .collection<Note>('notes')
            .find({ userId: req.userId })
            .sort({ updatedAt: -1 })
            .toArray();

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// GET a specific note by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        const note = await db.collection<Note>('notes').findOne({
            _id: new ObjectId(id),
            userId: req.userId, // Ensure user owns the note
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});

// POST create a new note
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { title, content }: CreateNoteInput = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const now = new Date();
        const newNote: Note = {
            userId: req.userId!,
            title,
            content,
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<Note>('notes').insertOne(newNote);

        res.status(201).json({
            _id: result.insertedId,
            ...newNote,
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// PUT update an existing note
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content }: UpdateNoteInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        if (!title && !content) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const updateData: Partial<Note> = {
            updatedAt: new Date(),
        };

        if (title) updateData.title = title;
        if (content) updateData.content = content;

        const result = await db.collection<Note>('notes').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId, // Ensure user owns the note
            },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// DELETE a note
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        const result = await db.collection<Note>('notes').deleteOne({
            _id: new ObjectId(id),
            userId: req.userId, // Ensure user owns the note
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

export default router;