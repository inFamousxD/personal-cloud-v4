import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { EffectivePermissions } from '../models/Permissions.js';
import { ensureUserPermissions } from '../utils/permissions.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
    userName?: string;
    permissions?: EffectivePermissions;
    isAdmin?: boolean;
}

export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.sub) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        req.userId = payload.sub;
        req.userEmail = payload.email;
        req.userName = payload.name;
        
        // Ensure user has permissions record (creates if new user)
        await ensureUserPermissions({
            userId: payload.sub,
            email: payload.email,
            name: payload.name,
        });

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};