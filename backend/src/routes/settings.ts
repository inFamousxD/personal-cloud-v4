import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { UserSettings, UpdateThemeInput } from '../models/UserSettings.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET user's theme settings
router.get('/theme', async (req: AuthRequest, res: Response) => {
    try {
        const settings = await db
            .collection<UserSettings>('userSettings')
            .findOne({ userId: req.userId });

        if (!settings) {
            // Return default settings if none exist
            return res.json({
                themeId: 'default-dark',
                customTheme: null
            });
        }

        res.json({
            themeId: settings.themeId,
            customTheme: settings.customTheme || null
        });
    } catch (error) {
        console.error('Error fetching theme settings:', error);
        res.status(500).json({ error: 'Failed to fetch theme settings' });
    }
});

// PUT update user's theme settings
router.put('/theme', async (req: AuthRequest, res: Response) => {
    try {
        const { themeId, customTheme }: UpdateThemeInput = req.body;

        if (!themeId) {
            return res.status(400).json({ error: 'themeId is required' });
        }

        const now = new Date();
        
        const updateData: Partial<UserSettings> = {
            themeId,
            updatedAt: now
        };

        if (customTheme !== undefined) {
            updateData.customTheme = customTheme;
        }

        const result = await db.collection<UserSettings>('userSettings').findOneAndUpdate(
            { userId: req.userId },
            {
                $set: updateData,
                $setOnInsert: {
                    userId: req.userId!,
                    createdAt: now
                }
            },
            { 
                upsert: true,
                returnDocument: 'after'
            }
        );

        res.json({
            themeId: result?.themeId || themeId,
            customTheme: result?.customTheme || customTheme
        });
    } catch (error) {
        console.error('Error updating theme settings:', error);
        res.status(500).json({ error: 'Failed to update theme settings' });
    }
});

// GET all user settings
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const settings = await db
            .collection<UserSettings>('userSettings')
            .findOne({ userId: req.userId });

        if (!settings) {
            return res.json({
                themeId: 'default-dark',
                customTheme: null
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ error: 'Failed to fetch user settings' });
    }
});

export default router;