import { Router, Response, Request } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { 
    List, 
    ListFolder, 
    CreateListInput, 
    UpdateListInput,
    ShareListInput,
    CreateListFolderInput,
    UpdateListFolderInput 
} from '../models/List.js';
import crypto from 'crypto';

const router = Router();

// ===== SHARED LIST ROUTES (NO AUTH REQUIRED) =====

// GET shared list (no authentication required)
router.get('/shared/:shareId', async (req: Request, res: Response) => {
    try {
        const { shareId } = req.params;

        const list = await db.collection<List>('lists').findOne({
            shareId,
            shareMode: { $in: ['read-only', 'read-write'] }
        });

        if (!list) {
            return res.status(404).json({ error: 'Shared list not found' });
        }

        res.json(list);
    } catch (error) {
        console.error('Error fetching shared list:', error);
        res.status(500).json({ error: 'Failed to fetch shared list' });
    }
});

// PUT update shared list (no authentication required, but requires read-write mode)
router.put('/shared/:shareId', async (req: Request, res: Response) => {
    try {
        const { shareId } = req.params;
        const { items, title, tags }: UpdateListInput = req.body;

        // First check if the list exists and is in read-write mode
        const existingList = await db.collection<List>('lists').findOne({
            shareId,
            shareMode: 'read-write'
        });

        if (!existingList) {
            return res.status(403).json({ 
                error: 'List not found or does not allow editing' 
            });
        }

        const updateData: Partial<List> = {
            updatedAt: new Date(),
        };

        if (items !== undefined) updateData.items = items;
        if (title !== undefined) updateData.title = title;
        if (tags !== undefined) updateData.tags = tags;

        const result = await db.collection<List>('lists').findOneAndUpdate(
            { shareId, shareMode: 'read-write' },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Failed to update list' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating shared list:', error);
        res.status(500).json({ error: 'Failed to update shared list' });
    }
});

// ===== AUTHENTICATED ROUTES =====

// Apply authentication middleware to all authenticated routes
router.use(authenticateToken);

// ===== FOLDER ROUTES =====

// GET all folders for the authenticated user
router.get('/folders', async (req: AuthRequest, res: Response) => {
    try {
        const folders = await db
            .collection<ListFolder>('list_folders')
            .find({ userId: req.userId })
            .sort({ name: 1 })
            .toArray();

        res.json(folders);
    } catch (error) {
        console.error('Error fetching list folders:', error);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
});

// POST create a new folder
router.post('/folders', async (req: AuthRequest, res: Response) => {
    try {
        const { name }: CreateListFolderInput = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const now = new Date();
        const newFolder: ListFolder = {
            userId: req.userId!,
            name: name.trim(),
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<ListFolder>('list_folders').insertOne(newFolder);

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
        const { name }: UpdateListFolderInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid folder ID' });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const result = await db.collection<ListFolder>('list_folders').findOneAndUpdate(
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

// DELETE a folder (only if it has no lists)
router.delete('/folders/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid folder ID' });
        }

        // Check if folder has any lists
        const listCount = await db.collection<List>('lists').countDocuments({
            userId: req.userId,
            folderId: id,
        });

        if (listCount > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete folder with lists. Please move or delete lists first.' 
            });
        }

        const result = await db.collection<ListFolder>('list_folders').deleteOne({
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

// ===== LIST ROUTES =====

// GET all tags for the authenticated user
router.get('/tags', async (req: AuthRequest, res: Response) => {
    try {
        const lists = await db
            .collection<List>('lists')
            .find({ userId: req.userId })
            .toArray();

        const allTags = lists.flatMap(list => list.tags || []);
        const uniqueTags = [...new Set(allTags)].filter(tag => tag !== 'default').sort();

        res.json(uniqueTags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// GET all lists for the authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const lists = await db
            .collection<List>('lists')
            .find({ userId: req.userId })
            .sort({ updatedAt: -1 })
            .toArray();

        res.json(lists);
    } catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({ error: 'Failed to fetch lists' });
    }
});

// GET a specific list by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid list ID' });
        }

        const list = await db.collection<List>('lists').findOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        res.json(list);
    } catch (error) {
        console.error('Error fetching list:', error);
        res.status(500).json({ error: 'Failed to fetch list' });
    }
});

// POST create a new list
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { title, items, tags, folderId }: CreateListInput = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Validate folderId if provided
        if (folderId) {
            if (!ObjectId.isValid(folderId)) {
                return res.status(400).json({ error: 'Invalid folder ID' });
            }

            const folder = await db.collection<ListFolder>('list_folders').findOne({
                _id: new ObjectId(folderId),
                userId: req.userId,
            });

            if (!folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }
        }

        const now = new Date();
        const listTags = tags && tags.length > 0 ? tags : ['default'];

        const newList: List = {
            userId: req.userId!,
            folderId: folderId || null,
            title: title.trim(),
            items: items || [],
            tags: listTags,
            shareMode: 'none',
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<List>('lists').insertOne(newList);

        res.status(201).json({
            _id: result.insertedId,
            ...newList,
        });
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ error: 'Failed to create list' });
    }
});

// PUT update an existing list
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, items, tags, folderId }: UpdateListInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid list ID' });
        }

        if (!title && !items && !tags && folderId === undefined) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        // Validate folderId if provided
        if (folderId !== undefined && folderId !== null) {
            if (!ObjectId.isValid(folderId)) {
                return res.status(400).json({ error: 'Invalid folder ID' });
            }

            const folder = await db.collection<ListFolder>('list_folders').findOne({
                _id: new ObjectId(folderId),
                userId: req.userId,
            });

            if (!folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }
        }

        const updateData: Partial<List> = {
            updatedAt: new Date(),
        };

        if (title !== undefined) updateData.title = title.trim();
        if (items !== undefined) updateData.items = items;
        if (tags !== undefined) {
            updateData.tags = tags.length > 0 ? tags : ['default'];
        }
        if (folderId !== undefined) updateData.folderId = folderId;

        const result = await db.collection<List>('lists').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'List not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ error: 'Failed to update list' });
    }
});

// DELETE a list
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid list ID' });
        }

        const result = await db.collection<List>('lists').deleteOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'List not found' });
        }

        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ error: 'Failed to delete list' });
    }
});

// ===== SHARING ROUTES =====

// POST enable sharing for a list
router.post('/:id/share', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { shareMode }: ShareListInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid list ID' });
        }

        if (!shareMode || !['read-only', 'read-write'].includes(shareMode)) {
            return res.status(400).json({ 
                error: 'Valid share mode required (read-only or read-write)' 
            });
        }

        // Generate unique share ID
        const shareId = crypto.randomBytes(16).toString('hex');

        const result = await db.collection<List>('lists').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { 
                $set: { 
                    shareId,
                    shareMode,
                    updatedAt: new Date()
                } 
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'List not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error enabling sharing:', error);
        res.status(500).json({ error: 'Failed to enable sharing' });
    }
});

// PUT update share mode
router.put('/:id/share', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { shareMode }: ShareListInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid list ID' });
        }

        if (!shareMode || !['read-only', 'read-write'].includes(shareMode)) {
            return res.status(400).json({ 
                error: 'Valid share mode required (read-only or read-write)' 
            });
        }

        const result = await db.collection<List>('lists').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { 
                $set: { 
                    shareMode,
                    updatedAt: new Date()
                } 
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'List not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating share mode:', error);
        res.status(500).json({ error: 'Failed to update share mode' });
    }
});

// DELETE disable sharing
router.delete('/:id/share', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid list ID' });
        }

        const result = await db.collection<List>('lists').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { 
                $unset: { shareId: '' },
                $set: { 
                    shareMode: 'none',
                    updatedAt: new Date()
                } 
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'List not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error disabling sharing:', error);
        res.status(500).json({ error: 'Failed to disable sharing' });
    }
});

export default router;