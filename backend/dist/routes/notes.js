"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const main_1 = require("../main");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
// GET all notes for the authenticated user
router.get('/', async (req, res) => {
    try {
        const notes = await main_1.db
            .collection('notes')
            .find({ userId: req.userId })
            .sort({ updatedAt: -1 })
            .toArray();
        res.json(notes);
    }
    catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});
// GET a specific note by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }
        const note = await main_1.db.collection('notes').findOne({
            _id: new mongodb_1.ObjectId(id),
            userId: req.userId, // Ensure user owns the note
        });
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note);
    }
    catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});
// POST create a new note
router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const now = new Date();
        const newNote = {
            userId: req.userId,
            title,
            content,
            createdAt: now,
            updatedAt: now,
        };
        const result = await main_1.db.collection('notes').insertOne(newNote);
        res.status(201).json({
            _id: result.insertedId,
            ...newNote,
        });
    }
    catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});
// PUT update an existing note
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        if (!mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }
        if (!title && !content) {
            return res.status(400).json({ error: 'Nothing to update' });
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (title)
            updateData.title = title;
        if (content)
            updateData.content = content;
        const result = await main_1.db.collection('notes').findOneAndUpdate({
            _id: new mongodb_1.ObjectId(id),
            userId: req.userId, // Ensure user owns the note
        }, { $set: updateData }, { returnDocument: 'after' });
        if (!result) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(result);
    }
    catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});
// DELETE a note
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }
        const result = await main_1.db.collection('notes').deleteOne({
            _id: new mongodb_1.ObjectId(id),
            userId: req.userId, // Ensure user owns the note
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});
exports.default = router;
