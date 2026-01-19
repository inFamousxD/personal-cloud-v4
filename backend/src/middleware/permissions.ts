import { Response, NextFunction } from 'express';
import { db } from '../db.js';
import { AuthRequest } from './auth.js';
import { 
    UserPermissions, 
    DefaultPermissions, 
    ALL_FEATURES,
    ALWAYS_ALLOWED_FEATURES,
    DEFAULT_DENIED_FEATURES,
    EffectivePermissions 
} from '../models/Permissions.js';

// Cache for default permissions (refreshed periodically)
let cachedDefaults: DefaultPermissions | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

async function getDefaultPermissions(): Promise<DefaultPermissions> {
    const now = Date.now();
    
    if (cachedDefaults && (now - cacheTimestamp) < CACHE_TTL) {
        return cachedDefaults;
    }
    
    const defaults = await db.collection<DefaultPermissions>('default_permissions').findOne({ 
        _id: 'default' as any 
    });
    
    if (defaults) {
        cachedDefaults = defaults;
        cacheTimestamp = now;
        return defaults;
    }
    
    // Return hardcoded defaults if not in DB yet
    return {
        _id: 'default',
        deniedFeatures: [...DEFAULT_DENIED_FEATURES],
        updatedAt: new Date(),
        updatedBy: 'system',
    };
}

// Invalidate cache when defaults are updated
export function invalidateDefaultPermissionsCache(): void {
    cachedDefaults = null;
    cacheTimestamp = 0;
}

export async function getEffectivePermissions(userId: string): Promise<EffectivePermissions> {
    const userPerms = await db.collection<UserPermissions>('user_permissions').findOne({ userId });
    
    // Admin has all access
    if (userPerms?.isAdmin) {
        return {
            userId,
            isAdmin: true,
            deniedFeatures: [],
            allowedFeatures: [...ALL_FEATURES],
            useDefaults: false,
        };
    }
    
    let deniedFeatures: string[];
    let useDefaults: boolean;
    
    if (!userPerms || userPerms.useDefaults) {
        // Use defaults
        const defaults = await getDefaultPermissions();
        deniedFeatures = defaults.deniedFeatures;
        useDefaults = true;
    } else {
        // Use user-specific settings
        deniedFeatures = userPerms.deniedFeatures;
        useDefaults = false;
    }
    
    // Filter out always-allowed features from denied list
    deniedFeatures = deniedFeatures.filter(f => !ALWAYS_ALLOWED_FEATURES.includes(f as any));
    
    const allowedFeatures = ALL_FEATURES.filter(f => !deniedFeatures.includes(f));
    
    return {
        userId,
        isAdmin: false,
        deniedFeatures,
        allowedFeatures,
        useDefaults,
    };
}

// Middleware: Check if user has access to a specific feature
export function requireFeature(feature: string) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            
            const permissions = await getEffectivePermissions(req.userId);
            
            if (permissions.deniedFeatures.includes(feature)) {
                return res.status(403).json({ 
                    error: 'Access denied',
                    message: 'You do not have permission to access this feature. Please request access from an administrator.',
                    feature,
                });
            }
            
            // Attach permissions to request for downstream use
            req.permissions = permissions;
            next();
        } catch (error) {
            console.error('Error checking feature permission:', error);
            res.status(500).json({ error: 'Failed to verify permissions' });
        }
    };
}

// Middleware: Check if user is an admin
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const userPerms = await db.collection<UserPermissions>('user_permissions').findOne({ 
            userId: req.userId 
        });
        
        if (!userPerms?.isAdmin) {
            return res.status(403).json({ 
                error: 'Admin access required',
                message: 'This action requires administrator privileges.',
            });
        }
        
        req.isAdmin = true;
        next();
    } catch (error) {
        console.error('Error checking admin permission:', error);
        res.status(500).json({ error: 'Failed to verify admin status' });
    }
}

// Extend AuthRequest to include permissions
declare module './auth.js' {
    interface AuthRequest {
        permissions?: EffectivePermissions;
        isAdmin?: boolean;
    }
}