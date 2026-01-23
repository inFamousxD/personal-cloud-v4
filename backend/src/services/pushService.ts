import webpush from 'web-push';
import { db } from '../db.js';
import { PushSubscription } from '../models/Note.js';

// VAPID keys - should be in environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
    console.log('[Push Service] VAPID details configured');
} else {
    console.warn('[Push Service] WARNING: VAPID keys not configured - push notifications will not work');
}

export interface NotificationPayload {
    title: string;
    body: string;
    tag: string;
    noteId: string;
    reminderId: string;
    data?: any;
}

export const pushService = {
    /**
     * Subscribe a user to push notifications
     */
    async subscribe(userId: string, subscription: any): Promise<void> {
        try {
            console.log(`[Push Service] Subscribing user ${userId} with endpoint: ${subscription.endpoint.substring(0, 50)}...`);
            
            const existingSub = await db.collection<PushSubscription>('pushSubscriptions').findOne({
                userId,
                endpoint: subscription.endpoint
            });

            if (existingSub) {
                // Update existing subscription
                await db.collection<PushSubscription>('pushSubscriptions').updateOne(
                    { _id: existingSub._id },
                    { 
                        $set: { 
                            keys: subscription.keys,
                            createdAt: new Date()
                        } 
                    }
                );
                console.log(`[Push Service] Updated existing subscription for user ${userId}`);
            } else {
                // Create new subscription
                await db.collection<PushSubscription>('pushSubscriptions').insertOne({
                    userId,
                    endpoint: subscription.endpoint,
                    keys: subscription.keys,
                    createdAt: new Date()
                });
                console.log(`[Push Service] Created new subscription for user ${userId}`);
            }
        } catch (error) {
            console.error('[Push Service] Error saving push subscription:', error);
            throw error;
        }
    },

    /**
     * Unsubscribe a user from push notifications
     */
    async unsubscribe(userId: string, endpoint: string): Promise<void> {
        try {
            await db.collection<PushSubscription>('pushSubscriptions').deleteOne({
                userId,
                endpoint
            });
            console.log(`[Push Service] Unsubscribed user ${userId}`);
        } catch (error) {
            console.error('[Push Service] Error removing push subscription:', error);
            throw error;
        }
    },

    /**
     * Send notification to a specific user
     */
    async sendNotification(userId: string, payload: NotificationPayload): Promise<void> {
        try {
            console.log(`[Push Service] Attempting to send notification to user ${userId}`);
            
            const subscriptions = await db.collection<PushSubscription>('pushSubscriptions')
                .find({ userId })
                .toArray();

            console.log(`[Push Service] Found ${subscriptions.length} subscription(s) for user ${userId}`);

            if (subscriptions.length === 0) {
                console.log(`[Push Service] No subscriptions found for user ${userId}`);
                return;
            }

            const notificationPayload = JSON.stringify({
                title: payload.title,
                body: payload.body,
                tag: payload.tag,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                data: {
                    noteId: payload.noteId,
                    reminderId: payload.reminderId,
                    ...payload.data
                }
            });

            console.log(`[Push Service] Notification payload:`, notificationPayload);

            const sendPromises = subscriptions.map(async (sub, index) => {
                try {
                    console.log(`[Push Service] Sending to subscription ${index + 1}/${subscriptions.length}: ${sub.endpoint.substring(0, 50)}...`);
                    
                    const result = await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: {
                                p256dh: sub.keys.p256dh,
                                auth: sub.keys.auth
                            }
                        },
                        notificationPayload
                    );
                    
                    console.log(`[Push Service] Successfully sent notification to subscription ${index + 1}, status: ${result.statusCode}`);
                } catch (error: any) {
                    console.error(`[Push Service] Error sending to subscription ${index + 1}:`, error.message);
                    
                    // If subscription is invalid, remove it
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        console.log(`[Push Service] Removing invalid subscription: ${sub.endpoint.substring(0, 50)}...`);
                        await this.unsubscribe(userId, sub.endpoint);
                    }
                }
            });

            await Promise.all(sendPromises);
            console.log(`[Push Service] Completed sending notifications to user ${userId}`);
        } catch (error) {
            console.error('[Push Service] Error in sendNotification:', error);
            throw error;
        }
    },

    /**
     * Get VAPID public key for client
     */
    getPublicKey(): string {
        return VAPID_PUBLIC_KEY;
    },

    /**
     * Check if push service is configured
     */
    isConfigured(): boolean {
        const configured = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
        console.log(`[Push Service] Configuration check: ${configured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
        return configured;
    }
};