import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

class PushNotificationService {
    private vapidPublicKey: string | null = null;

    async initialize(): Promise<boolean> {
        try {
            console.log('[Push] Initializing push notification service...');
            
            // Check if push notifications are supported
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn('[Push] Push notifications not supported');
                return false;
            }

            // Get VAPID public key from server
            const response = await axios.get(`${API_URL}/api/push/vapid-public-key`, {
                headers: getAuthHeader()
            });

            if (!response.data.configured) {
                console.warn('[Push] Push service not configured on server');
                return false;
            }

            this.vapidPublicKey = response.data.publicKey;
            console.log('[Push] VAPID public key retrieved');
            return true;
        } catch (error) {
            console.error('[Push] Failed to initialize:', error);
            return false;
        }
    }

    async subscribe(): Promise<boolean> {
        try {
            console.log('[Push] Starting subscription process...');
            
            // Request notification permission
            const permission = await Notification.requestPermission();
            console.log('[Push] Notification permission:', permission);
            
            if (permission !== 'granted') {
                console.log('[Push] Notification permission denied');
                return false;
            }

            // Ensure we have the VAPID key
            if (!this.vapidPublicKey) {
                const initialized = await this.initialize();
                if (!initialized) {
                    console.error('[Push] Could not initialize push service');
                    return false;
                }
            }

            // Wait for service worker to be ready
            console.log('[Push] Waiting for service worker...');
            const registration = await navigator.serviceWorker.ready;
            console.log('[Push] Service worker ready:', registration);

            // Check for existing subscription
            let subscription = await registration.pushManager.getSubscription();
            console.log('[Push] Existing subscription:', subscription ? 'Found' : 'Not found');

            if (subscription) {
                console.log('[Push] Unsubscribing from existing subscription');
                await subscription.unsubscribe();
            }

            // Subscribe to push notifications
            console.log('[Push] Creating new subscription...');
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(this.vapidPublicKey!) as BufferSource
            });

            console.log('[Push] Subscription created:', subscription.endpoint.substring(0, 50) + '...');

            // Send subscription to server
            await axios.post(
                `${API_URL}/api/push/subscribe`,
                { subscription: subscription.toJSON() },
                { headers: getAuthHeader() }
            );

            console.log('[Push] Subscription saved to server');
            return true;
        } catch (error: any) {
            console.error('[Push] Subscription failed:', error);
            
            if (error.name === 'NotAllowedError') {
                console.error('[Push] Permission denied by user');
            } else if (error.name === 'NotSupportedError') {
                console.error('[Push] Push not supported');
            }
            
            return false;
        }
    }

    async unsubscribe(): Promise<boolean> {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await axios.post(
                    `${API_URL}/api/push/unsubscribe`,
                    { endpoint: subscription.endpoint },
                    { headers: getAuthHeader() }
                );

                await subscription.unsubscribe();
                console.log('[Push] Unsubscribed successfully');
                return true;
            }

            return false;
        } catch (error) {
            console.error('[Push] Unsubscribe failed:', error);
            return false;
        }
    }

    async isSubscribed(): Promise<boolean> {
        try {
            if (!('serviceWorker' in navigator)) {
                return false;
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            const subscribed = !!subscription;
            console.log('[Push] Subscription status:', subscribed);
            return subscribed;
        } catch (error) {
            console.error('[Push] Failed to check subscription:', error);
            return false;
        }
    }

    getPermission(): NotificationPermission {
        return Notification.permission;
    }

    async testNotification(): Promise<boolean> {
        try {
            await axios.post(
                `${API_URL}/api/push/test`,
                {},
                { headers: getAuthHeader() }
            );
            console.log('[Push] Test notification sent');
            return true;
        } catch (error) {
            console.error('[Push] Test notification failed:', error);
            return false;
        }
    }
}

export const pushNotificationService = new PushNotificationService();