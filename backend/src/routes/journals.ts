import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { 
    Journal, 
    Folder, 
    CreateJournalInput, 
    UpdateJournalInput,
    CreateFolderInput,
    UpdateFolderInput 
} from '../models/Journal.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ===== FOLDER ROUTES =====

// GET all folders for the authenticated user
router.get('/folders', async (req: AuthRequest, res: Response) => {
    try {
        const folders = await db
            .collection<Folder>('folders')
            .find({ userId: req.userId })
            .sort({ name: 1 })
            .toArray();

        res.json(folders);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
});

// POST create a new folder
router.post('/folders', async (req: AuthRequest, res: Response) => {
    try {
        const { name }: CreateFolderInput = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const now = new Date();
        const newFolder: Folder = {
            userId: req.userId!,
            name: name.trim(),
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<Folder>('folders').insertOne(newFolder);

        res.status(201).json({
            _id: result.insertedId,
            ...newFolder,
        });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

// PUT update a folder
router.put('/folders/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name }: UpdateFolderInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid folder ID' });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const result = await db.collection<Folder>('folders').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { 
                $set: { 
                    name: name.trim(),
                    updatedAt: new Date()
                } 
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating folder:', error);
        res.status(500).json({ error: 'Failed to update folder' });
    }
});

// DELETE a folder (only if it has no journals)
router.delete('/folders/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid folder ID' });
        }

        // Check if folder has any journals
        const journalCount = await db.collection<Journal>('journals').countDocuments({
            userId: req.userId,
            folderId: id,
        });

        if (journalCount > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete folder with journals. Please move or delete journals first.' 
            });
        }

        const result = await db.collection<Folder>('folders').deleteOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

// ===== JOURNAL ROUTES =====

// GET all journals for the authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const journals = await db
            .collection<Journal>('journals')
            .find({ userId: req.userId })
            .sort({ updatedAt: -1 })
            .toArray();

        res.json(journals);
    } catch (error) {
        console.error('Error fetching journals:', error);
        res.status(500).json({ error: 'Failed to fetch journals' });
    }
});

// GET a specific journal by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid journal ID' });
        }

        const journal = await db.collection<Journal>('journals').findOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (!journal) {
            return res.status(404).json({ error: 'Journal not found' });
        }

        res.json(journal);
    } catch (error) {
        console.error('Error fetching journal:', error);
        res.status(500).json({ error: 'Failed to fetch journal' });
    }
});

// POST create a new journal
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { title, subtitle, content, folderId }: CreateJournalInput = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Validate folderId if provided
        if (folderId) {
            if (!ObjectId.isValid(folderId)) {
                return res.status(400).json({ error: 'Invalid folder ID' });
            }

            const folder = await db.collection<Folder>('folders').findOne({
                _id: new ObjectId(folderId),
                userId: req.userId,
            });

            if (!folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }
        }

        const now = new Date();
        const defaultSubtitle = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const newJournal: Journal = {
            userId: req.userId!,
            folderId: folderId || null,
            title: title.trim(),
            subtitle: subtitle?.trim() || defaultSubtitle,
            content: content.trim(),
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<Journal>('journals').insertOne(newJournal);

        res.status(201).json({
            _id: result.insertedId,
            ...newJournal,
        });
    } catch (error) {
        console.error('Error creating journal:', error);
        res.status(500).json({ error: 'Failed to create journal' });
    }
});

// PUT update an existing journal
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, subtitle, content, folderId }: UpdateJournalInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid journal ID' });
        }

        if (!title && !subtitle && !content && folderId === undefined) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        // Validate folderId if provided
        if (folderId !== undefined && folderId !== null) {
            if (!ObjectId.isValid(folderId)) {
                return res.status(400).json({ error: 'Invalid folder ID' });
            }

            const folder = await db.collection<Folder>('folders').findOne({
                _id: new ObjectId(folderId),
                userId: req.userId,
            });

            if (!folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }
        }

        const updateData: Partial<Journal> = {
            updatedAt: new Date(),
        };

        if (title !== undefined) updateData.title = title.trim();
        if (subtitle !== undefined) updateData.subtitle = subtitle.trim();
        if (content !== undefined) updateData.content = content.trim();
        if (folderId !== undefined) updateData.folderId = folderId;

        const result = await db.collection<Journal>('journals').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Journal not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating journal:', error);
        res.status(500).json({ error: 'Failed to update journal' });
    }
});

// DELETE a journal
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid journal ID' });
        }

        const result = await db.collection<Journal>('journals').deleteOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Journal not found' });
        }

        res.json({ message: 'Journal deleted successfully' });
    } catch (error) {
        console.error('Error deleting journal:', error);
        res.status(500).json({ error: 'Failed to delete journal' });
    }
});

export default router;