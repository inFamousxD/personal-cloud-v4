import { db } from '../db.js';
import { UserPermissions, DEFAULT_DENIED_FEATURES } from '../models/Permissions.js';

interface UserInfo {
    userId: string;
    email?: string;
    name?: string;
}

/**
 * Ensures a user has a permissions record.
 * Creates one with defaults if it doesn't exist.
 * Updates email/name if provided and changed.
 */
export async function ensureUserPermissions(userInfo: UserInfo): Promise<UserPermissions> {
    const { userId, email, name } = userInfo;
    
    const existing = await db.collection<UserPermissions>('user_permissions').findOne({ userId });
    
    if (existing) {
        // Update email/name if changed
        if ((email && email !== existing.email) || (name && name !== existing.name)) {
            await db.collection<UserPermissions>('user_permissions').updateOne(
                { userId },
                { 
                    $set: { 
                        ...(email && { email }),
                        ...(name && { name }),
                        updatedAt: new Date(),
                    } 
                }
            );
        }
        return existing;
    }
    
    // Create new user permissions with defaults
    const newPerms: UserPermissions = {
        userId,
        email,
        name,
        isAdmin: false,
        deniedFeatures: [...DEFAULT_DENIED_FEATURES],
        useDefaults: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        grantedBy: 'system',
    };
    
    await db.collection<UserPermissions>('user_permissions').insertOne(newPerms);
    console.log(`Created permissions for new user: ${email || userId}`);
    
    return newPerms;
}