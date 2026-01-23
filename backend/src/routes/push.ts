import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { pushService } from '../services/pushService.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET VAPID public key
router.get('/vapid-public-key', (_req: AuthRequest, res: Response) => {
    try {
        const publicKey = pushService.getPublicKey();
        
        if (!publicKey) {
            return res.status(503).json({ 
                error: 'Push notifications not configured',
                configured: false 
            });
        }

        res.json({ 
            publicKey,
            configured: true 
        });
    } catch (error) {
        console.error('Error getting VAPID public key:', error);
        res.status(500).json({ error: 'Failed to get public key' });
    }
});

// POST subscribe to push notifications
router.post('/subscribe', async (req: AuthRequest, res: Response) => {
    try {
        const { subscription } = req.body;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ error: 'Invalid subscription object' });
        }

        if (!pushService.isConfigured()) {
            return res.status(503).json({ error: 'Push notifications not configured' });
        }

        await pushService.subscribe(req.userId!, subscription);

        res.json({ success: true, message: 'Subscribed to push notifications' });
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// POST unsubscribe from push notifications
router.post('/unsubscribe', async (req: AuthRequest, res: Response) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint is required' });
        }

        await pushService.unsubscribe(req.userId!, endpoint);

        res.json({ success: true, message: 'Unsubscribed from push notifications' });
    } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

// POST test notification (for debugging)
router.post('/test', async (req: AuthRequest, res: Response) => {
    try {
        if (!pushService.isConfigured()) {
            return res.status(503).json({ error: 'Push notifications not configured' });
        }

        await pushService.sendNotification(req.userId!, {
            title: 'Test Notification',
            body: 'This is a test notification from your notes app!',
            tag: 'test-notification',
            noteId: 'test',
            reminderId: 'test'
        });

        res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
});

export default router;