import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { 
    Drawing, 
    Folder, 
    CreateDrawingInput, 
    UpdateDrawingInput, 
    CreateFolderInput 
} from '../models/Drawing.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Configure image storage directory
const IMAGES_BASE_DIR = process.env.DRAWING_IMAGES_DIR || '/home/infamous/data/drawing-images';

// Multer configuration for image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Ensure images directory exists
const ensureImageDir = async (userId: string, drawingId: string): Promise<string> => {
    const userDir = path.join(IMAGES_BASE_DIR, userId, drawingId);
    await fs.mkdir(userDir, { recursive: true, mode: 0o700 });
    return userDir;
};

// Sanitize file ID to prevent directory traversal
const sanitizeFileId = (fileId: string): string => {
    return fileId.replace(/[^a-zA-Z0-9-_.]/g, '');
};

// ============== DRAWING ROUTES ==============

// GET all drawings for the authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const drawings = await db
            .collection<Drawing>('drawings')
            .find({ userId: req.userId })
            .sort({ updatedAt: -1 })
            .toArray();

        res.json(drawings);
    } catch (error) {
        console.error('Error fetching drawings:', error);
        res.status(500).json({ error: 'Failed to fetch drawings' });
    }
});

// GET a specific drawing by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid drawing ID' });
        }

        const drawing = await db.collection<Drawing>('drawings').findOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (!drawing) {
            return res.status(404).json({ error: 'Drawing not found' });
        }

        res.json(drawing);
    } catch (error) {
        console.error('Error fetching drawing:', error);
        res.status(500).json({ error: 'Failed to fetch drawing' });
    }
});

// POST create a new drawing
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { title, sceneData, folderId }: CreateDrawingInput = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const now = new Date();
        
        const newDrawing: Drawing = {
            userId: req.userId!,
            title,
            sceneData: sceneData || { elements: [], appState: {} },
            folderId: folderId || null,
            thumbnail: undefined,
            collaborators: [],
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<Drawing>('drawings').insertOne(newDrawing);

        res.status(201).json({
            _id: result.insertedId,
            ...newDrawing,
        });
    } catch (error) {
        console.error('Error creating drawing:', error);
        res.status(500).json({ error: 'Failed to create drawing' });
    }
});

// PUT update an existing drawing
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, sceneData, folderId, thumbnail }: UpdateDrawingInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid drawing ID' });
        }

        if (!title && !sceneData && folderId === undefined && !thumbnail) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const updateData: Partial<Drawing> = {
            updatedAt: new Date(),
        };

        if (title) updateData.title = title;
        if (sceneData) updateData.sceneData = sceneData;
        if (folderId !== undefined) updateData.folderId = folderId;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

        const result = await db.collection<Drawing>('drawings').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Drawing not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating drawing:', error);
        res.status(500).json({ error: 'Failed to update drawing' });
    }
});

// DELETE a drawing
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid drawing ID' });
        }

        // Get drawing to check for stored images
        const drawing = await db.collection<Drawing>('drawings').findOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (!drawing) {
            return res.status(404).json({ error: 'Drawing not found' });
        }

        // Delete associated images if they exist
        if (drawing.sceneData.files) {
            const imageDir = path.join(IMAGES_BASE_DIR, req.userId!, id);
            try {
                await fs.rm(imageDir, { recursive: true, force: true });
            } catch (err) {
                console.warn('Failed to delete image directory:', err);
            }
        }

        // Delete the drawing
        const result = await db.collection<Drawing>('drawings').deleteOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Drawing not found' });
        }

        res.json({ message: 'Drawing deleted successfully' });
    } catch (error) {
        console.error('Error deleting drawing:', error);
        res.status(500).json({ error: 'Failed to delete drawing' });
    }
});

// ============== IMAGE ROUTES ==============

// POST upload image for a drawing
router.post('/:id/images', upload.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid drawing ID' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Verify drawing belongs to user
        const drawing = await db.collection<Drawing>('drawings').findOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (!drawing) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Validate file type
        const fileType = await fileTypeFromBuffer(req.file.buffer);
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        
        if (!fileType || !allowedTypes.includes(fileType.mime)) {
            return res.status(400).json({ error: 'Invalid image type. Only PNG, JPEG, and WebP are allowed.' });
        }

        // Generate unique image ID
        const imageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const extension = fileType.ext;
        const fileName = `${imageId}.${extension}`;

        // Ensure directory exists
        const imageDir = await ensureImageDir(req.userId!, id);
        const imagePath = path.join(imageDir, fileName);

        // Save file
        await fs.writeFile(imagePath, req.file.buffer, { mode: 0o600 });

        // Return reference
        res.json({
            imageId: fileName,
            url: `/api/drawings/${id}/images/${fileName}`,
            mimeType: fileType.mime,
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// GET retrieve image for a drawing
router.get('/:id/images/:imageId', async (req: AuthRequest, res: Response) => {
    try {
        const { id, imageId } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid drawing ID' });
        }

        // Verify user owns this drawing
        const drawing = await db.collection<Drawing>('drawings').findOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (!drawing) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Sanitize imageId
        const sanitizedImageId = sanitizeFileId(imageId);
        
        // Build and verify path
        const imagePath = path.join(IMAGES_BASE_DIR, req.userId!, id, sanitizedImageId);
        
        // Verify file exists and is within allowed directory
        try {
            const realPath = await fs.realpath(imagePath);
            const allowedDir = await fs.realpath(path.join(IMAGES_BASE_DIR, req.userId!, id));
            
            if (!realPath.startsWith(allowedDir)) {
                return res.status(403).json({ error: 'Invalid path' });
            }

            // Serve the file
            res.sendFile(realPath);
        } catch (err) {
            return res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Error retrieving image:', error);
        res.status(500).json({ error: 'Failed to retrieve image' });
    }
});

// DELETE remove image from a drawing
router.delete('/:id/images/:imageId', async (req: AuthRequest, res: Response) => {
    try {
        const { id, imageId } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid drawing ID' });
        }

        // Verify drawing belongs to user
        const drawing = await db.collection<Drawing>('drawings').findOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (!drawing) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Sanitize and delete image
        const sanitizedImageId = sanitizeFileId(imageId);
        const imagePath = path.join(IMAGES_BASE_DIR, req.userId!, id, sanitizedImageId);

        try {
            await fs.unlink(imagePath);
            res.json({ message: 'Image deleted successfully' });
        } catch (err) {
            return res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// ============== FOLDER ROUTES ==============

// GET all folders for the authenticated user
router.get('/folders/all', async (req: AuthRequest, res: Response) => {
    try {
        const folders = await db
            .collection<Folder>('drawing_folders')
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

        const result = await db.collection<Folder>('drawing_folders').insertOne(newFolder);

        res.status(201).json({
            _id: result.insertedId,
            ...newFolder,
        });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

// DELETE a folder (only if empty)
router.delete('/folders/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid folder ID' });
        }

        // Check if folder has any drawings
        const drawingCount = await db.collection<Drawing>('drawings').countDocuments({
            userId: req.userId,
            folderId: id,
        });

        if (drawingCount > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete folder with drawings. Please move or delete drawings first.' 
            });
        }

        const result = await db.collection<Folder>('drawing_folders').deleteOne({
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

export default router;