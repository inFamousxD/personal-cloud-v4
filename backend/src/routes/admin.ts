import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { requireAdmin, getEffectivePermissions, invalidateDefaultPermissionsCache } from '../middleware/permissions.js';
import { 
    UserPermissions, 
    DefaultPermissions,
    UpdateUserPermissionsInput,
    UpdateDefaultPermissionsInput,
    UserPermissionsListItem,
    ALL_FEATURES,
    ALWAYS_ALLOWED_FEATURES,
    DEFAULT_DENIED_FEATURES,
} from '../models/Permissions.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// ============================================
// CURRENT USER PERMISSIONS (non-admin) - MUST BE BEFORE PARAMETERIZED ROUTES
// ============================================

// GET current user's effective permissions
router.get('/me', async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const effective = await getEffectivePermissions(req.userId);
        
        res.json(effective);
    } catch (error) {
        console.error('Error fetching current user permissions:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
});

// ============================================
// DEFAULT PERMISSIONS MANAGEMENT
// ============================================

// GET default permissions
router.get('/defaults', requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        let defaults = await db.collection<DefaultPermissions>('default_permissions').findOne({ 
            _id: 'default' as any 
        });
        
        if (!defaults) {
            // Return hardcoded defaults if not in DB
            defaults = {
                _id: 'default',
                deniedFeatures: [...DEFAULT_DENIED_FEATURES],
                updatedAt: new Date(),
                updatedBy: 'system',
            };
        }
        
        res.json({
            deniedFeatures: defaults.deniedFeatures,
            allFeatures: ALL_FEATURES,
            alwaysAllowed: ALWAYS_ALLOWED_FEATURES,
            updatedAt: defaults.updatedAt,
            updatedBy: defaults.updatedBy,
        });
    } catch (error) {
        console.error('Error fetching default permissions:', error);
        res.status(500).json({ error: 'Failed to fetch default permissions' });
    }
});

// PUT update default permissions
router.put('/defaults', requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { deniedFeatures }: UpdateDefaultPermissionsInput = req.body;
        
        if (!Array.isArray(deniedFeatures)) {
            return res.status(400).json({ error: 'deniedFeatures must be an array' });
        }
        
        // Validate features
        const invalidFeatures = deniedFeatures.filter(f => !ALL_FEATURES.includes(f as any));
        if (invalidFeatures.length > 0) {
            return res.status(400).json({ 
                error: 'Invalid features',
                invalidFeatures,
                validFeatures: ALL_FEATURES,
            });
        }
        
        // Remove always-allowed features from denied list
        const filteredDenied = deniedFeatures.filter(f => !ALWAYS_ALLOWED_FEATURES.includes(f as any));
        
        const result = await db.collection<DefaultPermissions>('default_permissions').findOneAndUpdate(
            { _id: 'default' as any },
            {
                $set: {
                    deniedFeatures: filteredDenied,
                    updatedAt: new Date(),
                    updatedBy: req.userId,
                },
            },
            { upsert: true, returnDocument: 'after' }
        );
        
        // Invalidate cache
        invalidateDefaultPermissionsCache();
        
        res.json({
            message: 'Default permissions updated',
            deniedFeatures: result?.deniedFeatures || filteredDenied,
        });
    } catch (error) {
        console.error('Error updating default permissions:', error);
        res.status(500).json({ error: 'Failed to update default permissions' });
    }
});

// POST apply defaults to all non-admin users
router.post('/apply-defaults', requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const result = await db.collection<UserPermissions>('user_permissions').updateMany(
            { isAdmin: { $ne: true } },
            {
                $set: {
                    useDefaults: true,
                    updatedAt: new Date(),
                    grantedBy: req.userId,
                },
            }
        );
        
        res.json({
            message: 'Defaults applied to all non-admin users',
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error applying defaults:', error);
        res.status(500).json({ error: 'Failed to apply defaults' });
    }
});

// ============================================
// USER PERMISSIONS MANAGEMENT
// ============================================

// GET list all users with permissions
router.get('/users', requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { search, page = '1', limit = '50' } = req.query;
        
        const pageNum = parseInt(page as string, 10) || 1;
        const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
        const skip = (pageNum - 1) * limitNum;
        
        // Build query
        let query: any = {};
        if (search && typeof search === 'string') {
            query = {
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                    { userId: { $regex: search, $options: 'i' } },
                ],
            };
        }
        
        const [users, total, defaults] = await Promise.all([
            db.collection<UserPermissions>('user_permissions')
                .find(query)
                .sort({ isAdmin: -1, name: 1, email: 1 })
                .skip(skip)
                .limit(limitNum)
                .toArray(),
            db.collection<UserPermissions>('user_permissions').countDocuments(query),
            db.collection<DefaultPermissions>('default_permissions').findOne({ _id: 'default' as any }),
        ]);
        
        const defaultDenied = defaults?.deniedFeatures || DEFAULT_DENIED_FEATURES;
        
        // Map to response format with effective permissions
        const usersWithEffective: UserPermissionsListItem[] = users.map(user => ({
            userId: user.userId,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            useDefaults: user.useDefaults,
            deniedFeatures: user.deniedFeatures,
            effectiveDeniedFeatures: user.isAdmin ? [] : (user.useDefaults ? defaultDenied : user.deniedFeatures),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
        
        res.json({
            users: usersWithEffective,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET single user permissions
router.get('/users/:userId', requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        
        const user = await db.collection<UserPermissions>('user_permissions').findOne({ userId });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const effective = await getEffectivePermissions(userId);
        
        res.json({
            ...user,
            effectivePermissions: effective,
            allFeatures: ALL_FEATURES,
            alwaysAllowed: ALWAYS_ALLOWED_FEATURES,
        });
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        res.status(500).json({ error: 'Failed to fetch user permissions' });
    }
});

// PUT update user permissions
router.put('/users/:userId', requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { isAdmin, deniedFeatures, useDefaults }: UpdateUserPermissionsInput = req.body;
        
        // Check if target user exists
        const existingUser = await db.collection<UserPermissions>('user_permissions').findOne({ userId });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Prevent modifying other admins (unless it's self)
        if (existingUser.isAdmin && existingUser.userId !== req.userId) {
            return res.status(403).json({ 
                error: 'Cannot modify other administrators',
                message: 'Administrators cannot modify other administrators\' permissions.',
            });
        }
        
        // Build update
        const updateData: Partial<UserPermissions> = {
            updatedAt: new Date(),
            grantedBy: req.userId,
        };
        
        if (typeof isAdmin === 'boolean') {
            // Only allow setting isAdmin to true, not demoting self
            if (existingUser.userId === req.userId && isAdmin === false) {
                return res.status(400).json({ 
                    error: 'Cannot remove own admin status',
                    message: 'You cannot remove your own administrator privileges.',
                });
            }
            updateData.isAdmin = isAdmin;
        }
        
        if (typeof useDefaults === 'boolean') {
            updateData.useDefaults = useDefaults;
        }
        
        if (Array.isArray(deniedFeatures)) {
            // Validate features
            const invalidFeatures = deniedFeatures.filter(f => !ALL_FEATURES.includes(f as any));
            if (invalidFeatures.length > 0) {
                return res.status(400).json({ 
                    error: 'Invalid features',
                    invalidFeatures,
                    validFeatures: ALL_FEATURES,
                });
            }
            
            // Remove always-allowed features
            updateData.deniedFeatures = deniedFeatures.filter(
                f => !ALWAYS_ALLOWED_FEATURES.includes(f as any)
            );
        }
        
        const result = await db.collection<UserPermissions>('user_permissions').findOneAndUpdate(
            { userId },
            { $set: updateData },
            { returnDocument: 'after' }
        );
        
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const effective = await getEffectivePermissions(userId);
        
        res.json({
            message: 'User permissions updated',
            user: result,
            effectivePermissions: effective,
        });
    } catch (error) {
        console.error('Error updating user permissions:', error);
        res.status(500).json({ error: 'Failed to update user permissions' });
    }
});

export default router;