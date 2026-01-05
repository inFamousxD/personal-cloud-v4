import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import {
    Tracker,
    TrackerEntry,
    TrackerFolder,
    CreateTrackerInput,
    UpdateTrackerInput,
    CreateTrackerEntryInput,
    UpdateTrackerEntryInput,
    CreateTrackerFolderInput,
    UpdateTrackerFolderInput,
    TrackerStats,
    TrackerEntryQuery
} from '../models/Tracker.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ===== FOLDER ROUTES =====

// GET all folders for the authenticated user
router.get('/folders', async (req: AuthRequest, res: Response) => {
    try {
        const folders = await db
            .collection<TrackerFolder>('tracker_folders')
            .find({ userId: req.userId })
            .sort({ name: 1 })
            .toArray();

        res.json(folders);
    } catch (error) {
        console.error('Error fetching tracker folders:', error);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
});

// POST create a new folder
router.post('/folders', async (req: AuthRequest, res: Response) => {
    try {
        const { name, color, icon }: CreateTrackerFolderInput = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const now = new Date();
        const newFolder: TrackerFolder = {
            userId: req.userId!,
            name: name.trim(),
            color,
            icon,
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<TrackerFolder>('tracker_folders').insertOne(newFolder);

        res.status(201).json({
            _id: result.insertedId,
            ...newFolder,
        });
    } catch (error) {
        console.error('Error creating tracker folder:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

// PUT update a folder
router.put('/folders/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, color, icon }: UpdateTrackerFolderInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid folder ID' });
        }

        if (!name && !color && icon === undefined) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const updateData: Partial<TrackerFolder> = {
            updatedAt: new Date(),
        };

        if (name) updateData.name = name.trim();
        if (color) updateData.color = color;
        if (icon !== undefined) updateData.icon = icon;

        const result = await db.collection<TrackerFolder>('tracker_folders').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating tracker folder:', error);
        res.status(500).json({ error: 'Failed to update folder' });
    }
});

// DELETE a folder (only if it has no trackers)
router.delete('/folders/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid folder ID' });
        }

        // Check if folder has any trackers
        const trackerCount = await db.collection<Tracker>('trackers').countDocuments({
            userId: req.userId,
            folderId: id,
        });

        if (trackerCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete folder with trackers. Please move or delete trackers first.'
            });
        }

        const result = await db.collection<TrackerFolder>('tracker_folders').deleteOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Error deleting tracker folder:', error);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

// ===== TRACKER ROUTES =====

// GET all trackers for the authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { active } = req.query;
        
        const query: any = { userId: req.userId };
        
        if (active !== undefined) {
            query.isActive = active === 'true';
        }

        const trackers = await db
            .collection<Tracker>('trackers')
            .find(query)
            .sort({ updatedAt: -1 })
            .toArray();

        res.json(trackers);
    } catch (error) {
        console.error('Error fetching trackers:', error);
        res.status(500).json({ error: 'Failed to fetch trackers' });
    }
});

// GET all unique tags for the authenticated user
router.get('/tags', async (req: AuthRequest, res: Response) => {
    try {
        const trackers = await db
            .collection<Tracker>('trackers')
            .find({ userId: req.userId })
            .toArray();

        const allTags = trackers.flatMap(tracker => tracker.tags || []);
        const uniqueTags = [...new Set(allTags)].sort();

        res.json(uniqueTags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// GET a specific tracker by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid tracker ID' });
        }

        const tracker = await db.collection<Tracker>('trackers').findOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (!tracker) {
            return res.status(404).json({ error: 'Tracker not found' });
        }

        res.json(tracker);
    } catch (error) {
        console.error('Error fetching tracker:', error);
        res.status(500).json({ error: 'Failed to fetch tracker' });
    }
});

// POST create a new tracker
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, type, tags, config, folderId }: CreateTrackerInput = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Tracker name is required' });
        }

        if (!type || !['binary', 'numeric', 'duration', 'frequency', 'scale', 'target'].includes(type)) {
            return res.status(400).json({ error: 'Valid tracker type is required' });
        }

        // Validate folderId if provided
        if (folderId) {
            if (!ObjectId.isValid(folderId)) {
                return res.status(400).json({ error: 'Invalid folder ID' });
            }

            const folder = await db.collection<TrackerFolder>('tracker_folders').findOne({
                _id: new ObjectId(folderId),
                userId: req.userId,
            });

            if (!folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }
        }

        const now = new Date();
        const newTracker: Tracker = {
            userId: req.userId!,
            folderId: folderId || null,
            name: name.trim(),
            description: description?.trim(),
            type,
            tags: tags || [],
            config: config || {},
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<Tracker>('trackers').insertOne(newTracker);

        res.status(201).json({
            _id: result.insertedId,
            ...newTracker,
        });
    } catch (error) {
        console.error('Error creating tracker:', error);
        res.status(500).json({ error: 'Failed to create tracker' });
    }
});

// PUT update an existing tracker
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, tags, config, folderId, isActive }: UpdateTrackerInput = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid tracker ID' });
        }

        if (!name && !description && !tags && !config && folderId === undefined && isActive === undefined) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        // Validate folderId if provided
        if (folderId !== undefined && folderId !== null) {
            if (!ObjectId.isValid(folderId)) {
                return res.status(400).json({ error: 'Invalid folder ID' });
            }

            const folder = await db.collection<TrackerFolder>('tracker_folders').findOne({
                _id: new ObjectId(folderId),
                userId: req.userId,
            });

            if (!folder) {
                return res.status(404).json({ error: 'Folder not found' });
            }
        }

        const updateData: Partial<Tracker> = {
            updatedAt: new Date(),
        };

        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim();
        if (tags !== undefined) updateData.tags = tags;
        if (config !== undefined) updateData.config = config;
        if (folderId !== undefined) updateData.folderId = folderId;
        if (isActive !== undefined) updateData.isActive = isActive;

        const result = await db.collection<Tracker>('trackers').findOneAndUpdate(
            {
                _id: new ObjectId(id),
                userId: req.userId,
            },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Tracker not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating tracker:', error);
        res.status(500).json({ error: 'Failed to update tracker' });
    }
});

// DELETE a tracker (and all its entries)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid tracker ID' });
        }

        // Delete the tracker
        const trackerResult = await db.collection<Tracker>('trackers').deleteOne({
            _id: new ObjectId(id),
            userId: req.userId,
        });

        if (trackerResult.deletedCount === 0) {
            return res.status(404).json({ error: 'Tracker not found' });
        }

        // Delete all associated entries
        await db.collection<TrackerEntry>('tracker_entries').deleteMany({
            trackerId: id,
            userId: req.userId,
        });

        res.json({ message: 'Tracker and all entries deleted successfully' });
    } catch (error) {
        console.error('Error deleting tracker:', error);
        res.status(500).json({ error: 'Failed to delete tracker' });
    }
});

// ===== ENTRY ROUTES =====

// GET entries for a specific tracker
router.get('/:trackerId/entries', async (req: AuthRequest, res: Response) => {
    try {
        const { trackerId } = req.params;
        const { startDate, endDate, limit, skip } = req.query;

        if (!ObjectId.isValid(trackerId)) {
            return res.status(400).json({ error: 'Invalid tracker ID' });
        }

        // Verify tracker exists and belongs to user
        const tracker = await db.collection<Tracker>('trackers').findOne({
            _id: new ObjectId(trackerId),
            userId: req.userId,
        });

        if (!tracker) {
            return res.status(404).json({ error: 'Tracker not found' });
        }

        // Build query
        const query: any = {
            trackerId,
            userId: req.userId,
        };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate as string);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate as string);
            }
        }

        // Execute query with pagination
        const entries = await db
            .collection<TrackerEntry>('tracker_entries')
            .find(query)
            .sort({ date: -1 })
            .skip(skip ? parseInt(skip as string) : 0)
            .limit(limit ? parseInt(limit as string) : 100)
            .toArray();

        res.json(entries);
    } catch (error) {
        console.error('Error fetching tracker entries:', error);
        res.status(500).json({ error: 'Failed to fetch entries' });
    }
});

// GET a specific entry by date
router.get('/:trackerId/entries/:date', async (req: AuthRequest, res: Response) => {
    try {
        const { trackerId, date } = req.params;

        if (!ObjectId.isValid(trackerId)) {
            return res.status(400).json({ error: 'Invalid tracker ID' });
        }

        // Normalize date to start of day
        const entryDate = new Date(date);
        entryDate.setHours(0, 0, 0, 0);

        const entry = await db.collection<TrackerEntry>('tracker_entries').findOne({
            trackerId,
            userId: req.userId,
            date: entryDate,
        });

        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json(entry);
    } catch (error) {
        console.error('Error fetching tracker entry:', error);
        res.status(500).json({ error: 'Failed to fetch entry' });
    }
});

// POST create or update an entry for a specific date
router.post('/:trackerId/entries', async (req: AuthRequest, res: Response) => {
    try {
        const { trackerId } = req.params;
        const {
            date,
            completed,
            numericValue,
            durationValue,
            scaleValue,
            note,
            skipped
        }: CreateTrackerEntryInput = req.body;

        if (!ObjectId.isValid(trackerId)) {
            return res.status(400).json({ error: 'Invalid tracker ID' });
        }

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // Verify tracker exists and belongs to user
        const tracker = await db.collection<Tracker>('trackers').findOne({
            _id: new ObjectId(trackerId),
            userId: req.userId,
        });

        if (!tracker) {
            return res.status(404).json({ error: 'Tracker not found' });
        }

        // Normalize date to start of day
        const entryDate = new Date(date);
        entryDate.setHours(0, 0, 0, 0);

        const now = new Date();

        // Check if entry already exists for this date
        const existingEntry = await db.collection<TrackerEntry>('tracker_entries').findOne({
            trackerId,
            userId: req.userId!,
            date: entryDate,
        });

        if (existingEntry) {
            // Update existing entry
            const updateData: Partial<TrackerEntry> = {
                timestamp: now,
                updatedAt: now,
            };

            if (completed !== undefined) updateData.completed = completed;
            if (numericValue !== undefined) updateData.numericValue = numericValue;
            if (durationValue !== undefined) updateData.durationValue = durationValue;
            if (scaleValue !== undefined) updateData.scaleValue = scaleValue;
            if (note !== undefined) updateData.note = note;
            if (skipped !== undefined) updateData.skipped = skipped;

            const result = await db.collection<TrackerEntry>('tracker_entries').findOneAndUpdate(
                { _id: existingEntry._id },
                { $set: updateData },
                { returnDocument: 'after' }
            );

            return res.json(result);
        }

        // Create new entry
        const newEntry: TrackerEntry = {
            trackerId,
            userId: req.userId!,
            date: entryDate,
            timestamp: now,
            completed,
            numericValue,
            durationValue,
            scaleValue,
            note,
            skipped,
            createdAt: now,
            updatedAt: now,
        };

        const result = await db.collection<TrackerEntry>('tracker_entries').insertOne(newEntry);

        res.status(201).json({
            _id: result.insertedId,
            ...newEntry,
        });
    } catch (error) {
        console.error('Error creating/updating tracker entry:', error);
        res.status(500).json({ error: 'Failed to create/update entry' });
    }
});

// PUT update an existing entry
router.put('/:trackerId/entries/:entryId', async (req: AuthRequest, res: Response) => {
    try {
        const { trackerId, entryId } = req.params;
        const {
            completed,
            numericValue,
            durationValue,
            scaleValue,
            note,
            skipped
        }: UpdateTrackerEntryInput = req.body;

        if (!ObjectId.isValid(trackerId) || !ObjectId.isValid(entryId)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        const updateData: Partial<TrackerEntry> = {
            timestamp: new Date(),
            updatedAt: new Date(),
        };

        if (completed !== undefined) updateData.completed = completed;
        if (numericValue !== undefined) updateData.numericValue = numericValue;
        if (durationValue !== undefined) updateData.durationValue = durationValue;
        if (scaleValue !== undefined) updateData.scaleValue = scaleValue;
        if (note !== undefined) updateData.note = note;
        if (skipped !== undefined) updateData.skipped = skipped;

        const result = await db.collection<TrackerEntry>('tracker_entries').findOneAndUpdate(
            {
                _id: new ObjectId(entryId),
                trackerId,
                userId: req.userId,
            },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating tracker entry:', error);
        res.status(500).json({ error: 'Failed to update entry' });
    }
});

// DELETE an entry
router.delete('/:trackerId/entries/:entryId', async (req: AuthRequest, res: Response) => {
    try {
        const { trackerId, entryId } = req.params;

        if (!ObjectId.isValid(trackerId) || !ObjectId.isValid(entryId)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        const result = await db.collection<TrackerEntry>('tracker_entries').deleteOne({
            _id: new ObjectId(entryId),
            trackerId,
            userId: req.userId,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting tracker entry:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

// ===== STATISTICS ROUTES =====

// GET statistics for a specific tracker
router.get('/:trackerId/stats', async (req: AuthRequest, res: Response) => {
    try {
        const { trackerId } = req.params;

        if (!ObjectId.isValid(trackerId)) {
            return res.status(400).json({ error: 'Invalid tracker ID' });
        }

        // Verify tracker exists and belongs to user
        const tracker = await db.collection<Tracker>('trackers').findOne({
            _id: new ObjectId(trackerId),
            userId: req.userId,
        });

        if (!tracker) {
            return res.status(404).json({ error: 'Tracker not found' });
        }

        // Get all entries for this tracker
        const entries = await db
            .collection<TrackerEntry>('tracker_entries')
            .find({ trackerId, userId: req.userId })
            .sort({ date: 1 })
            .toArray();

        // Calculate statistics
        const stats: TrackerStats = {
            trackerId,
            currentStreak: 0,
            longestStreak: 0,
            totalEntries: entries.length,
            completionRate: 0,
        };

        if (entries.length === 0) {
            return res.json(stats);
        }

        // Calculate streaks (for binary/completed entries)
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastDate: Date | null = null;

        // Sort entries by date descending for current streak calculation
        const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());

        for (const entry of sortedEntries) {
            const isCompleted = entry.completed || 
                                (entry.numericValue !== undefined && entry.numericValue > 0) ||
                                (entry.durationValue !== undefined && entry.durationValue > 0) ||
                                (entry.scaleValue !== undefined);

            if (isCompleted && !entry.skipped) {
                if (!lastDate) {
                    // First entry
                    currentStreak = 1;
                    tempStreak = 1;
                } else {
                    const daysDiff = Math.floor((lastDate.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff === 1) {
                        // Consecutive day
                        currentStreak++;
                        tempStreak++;
                    } else {
                        // Streak broken
                        break;
                    }
                }
                lastDate = entry.date;
            } else {
                break;
            }
        }

        // Calculate longest streak from all entries
        tempStreak = 0;
        lastDate = null;
        
        for (const entry of entries) {
            const isCompleted = entry.completed || 
                                (entry.numericValue !== undefined && entry.numericValue > 0) ||
                                (entry.durationValue !== undefined && entry.durationValue > 0) ||
                                (entry.scaleValue !== undefined);

            if (isCompleted && !entry.skipped) {
                if (!lastDate) {
                    tempStreak = 1;
                } else {
                    const daysDiff = Math.floor((entry.date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff === 1) {
                        tempStreak++;
                    } else {
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                    }
                }
                lastDate = entry.date;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 0;
                lastDate = null;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        stats.currentStreak = currentStreak;
        stats.longestStreak = longestStreak;

        // Calculate completion rate
        const completedEntries = entries.filter(e => 
            (e.completed || 
             (e.numericValue !== undefined && e.numericValue > 0) ||
             (e.durationValue !== undefined && e.durationValue > 0) ||
             (e.scaleValue !== undefined)) && 
            !e.skipped
        ).length;

        stats.completionRate = entries.length > 0 
            ? Math.round((completedEntries / entries.length) * 100) 
            : 0;

        // Calculate average value for numeric/duration/scale trackers
        if (tracker.type === 'numeric' || tracker.type === 'duration' || tracker.type === 'scale') {
            const values: number[] = [];
            
            entries.forEach(entry => {
                if (tracker.type === 'numeric' && entry.numericValue !== undefined) {
                    values.push(entry.numericValue);
                } else if (tracker.type === 'duration' && entry.durationValue !== undefined) {
                    values.push(entry.durationValue);
                } else if (tracker.type === 'scale' && entry.scaleValue !== undefined) {
                    values.push(entry.scaleValue);
                }
            });

            if (values.length > 0) {
                stats.averageValue = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
            }
        }

        // Last entry date
        if (entries.length > 0) {
            stats.lastEntry = sortedEntries[0].date;
        }

        // This week count
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);

        stats.thisWeekCount = entries.filter(e => e.date >= weekStart).length;

        // This month count
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        stats.thisMonthCount = entries.filter(e => e.date >= monthStart).length;

        res.json(stats);
    } catch (error) {
        console.error('Error calculating tracker stats:', error);
        res.status(500).json({ error: 'Failed to calculate statistics' });
    }
});

export default router;