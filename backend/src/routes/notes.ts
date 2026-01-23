import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { Note, CreateNoteInput, UpdateNoteInput, NoteReminder } from '../models/Note.js';

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

// GET all unique tags for the authenticated user
router.get('/tags', async (req: AuthRequest, res: Response) => {
    try {
        const notes = await db
            .collection<Note>('notes')
            .find({ userId: req.userId })
            .toArray();

        const allTags = notes.flatMap(note => note.tags || []);
        const uniqueTags = [...new Set(allTags)].filter(tag => tag !== 'default').sort();

        res.json(uniqueTags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
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
            userId: req.userId,
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
        const { title, content, tags, isPinned }: CreateNoteInput = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const now = new Date();
        const noteTags = tags && tags.length > 0 ? tags : ['default'];
        const noteContent = content || '';
        
        const newNote: Note = {
            userId: req.userId!,
            title,
            content: noteContent,
            tags: noteTags,
            isPinned: isPinned || false,
            reminders: [],
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
        const { title, content, tags, isPinned, reminders }: UpdateNoteInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        if (!title && !content && !tags && isPinned === undefined && !reminders) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const updateData: Partial<Note> = {
            updatedAt: new Date(),
        };

        if (title) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (tags !== undefined) {
            updateData.tags = tags.length > 0 ? tags : ['default'];
        }
        if (isPinned !== undefined) updateData.isPinned = isPinned;
        if (reminders !== undefined) updateData.reminders = reminders;

        const result = await db.collection<Note>('notes').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
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
            userId: req.userId,
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

// POST add a reminder to a note
router.post('/:id/reminders', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const reminder: NoteReminder = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        if (!reminder.dateTime) {
            return res.status(400).json({ error: 'Reminder dateTime is required' });
        }

        // Generate ID if not provided
        if (!reminder.id) {
            reminder.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        reminder.lastModified = new Date();

        const result = await db.collection<Note>('notes').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { 
                $push: { reminders: reminder },
                $set: { updatedAt: new Date() }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error adding reminder:', error);
        res.status(500).json({ error: 'Failed to add reminder' });
    }
});

// PUT update a specific reminder
router.put('/:id/reminders/:reminderId', async (req: AuthRequest, res: Response) => {
    try {
        const { id, reminderId } = req.params;
        const updates = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        // Build update object for the specific reminder
        const updateFields: any = {};
        Object.keys(updates).forEach(key => {
            updateFields[`reminders.$.${key}`] = updates[key];
        });
        updateFields['reminders.$.lastModified'] = new Date();

        const result = await db.collection<Note>('notes').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
                'reminders.id': reminderId
            },
            { 
                $set: {
                    ...updateFields,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Note or reminder not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({ error: 'Failed to update reminder' });
    }
});

// DELETE a specific reminder
router.delete('/:id/reminders/:reminderId', async (req: AuthRequest, res: Response) => {
    try {
        const { id, reminderId } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        const result = await db.collection<Note>('notes').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { 
                $pull: { reminders: { id: reminderId } },
                $set: { updatedAt: new Date() }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ error: 'Failed to delete reminder' });
    }
});

export default router;