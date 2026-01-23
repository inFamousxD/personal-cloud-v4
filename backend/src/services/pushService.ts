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
            } else {
                // Create new subscription
                await db.collection<PushSubscription>('pushSubscriptions').insertOne({
                    userId,
                    endpoint: subscription.endpoint,
                    keys: subscription.keys,
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.error('Error saving push subscription:', error);
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
        } catch (error) {
            console.error('Error removing push subscription:', error);
            throw error;
        }
    },

    /**
     * Send notification to a specific user
     */
    async sendNotification(userId: string, payload: NotificationPayload): Promise<void> {
        try {
            const subscriptions = await db.collection<PushSubscription>('pushSubscriptions')
                .find({ userId })
                .toArray();

            if (subscriptions.length === 0) {
                console.log(`No subscriptions found for user ${userId}`);
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

            const sendPromises = subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: {
                                p256dh: sub.keys.p256dh,
                                auth: sub.keys.auth
                            }
                        },
                        notificationPayload
                    );
                } catch (error: any) {
                    // If subscription is invalid, remove it
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        console.log(`Removing invalid subscription: ${sub.endpoint}`);
                        await this.unsubscribe(userId, sub.endpoint);
                    } else {
                        console.error('Error sending push notification:', error);
                    }
                }
            });

            await Promise.all(sendPromises);
        } catch (error) {
            console.error('Error in sendNotification:', error);
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
        return !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
    }
};