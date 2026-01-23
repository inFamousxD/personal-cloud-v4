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

export interface PushSubscriptionInfo {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

class PushNotificationService {
    private registration: ServiceWorkerRegistration | null = null;
    private subscription: PushSubscription | null = null;

    /**
     * Initialize push notifications
     */
    async init(): Promise<boolean> {
        try {
            // Check if service workers are supported
            if (!('serviceWorker' in navigator)) {
                console.log('Service workers not supported');
                return false;
            }

            // Check if push notifications are supported
            if (!('PushManager' in window)) {
                console.log('Push notifications not supported');
                return false;
            }

            // Register service worker
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('Service Worker registered:', this.registration);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;

            return true;
        } catch (error) {
            console.error('Error initializing push notifications:', error);
            return false;
        }
    }

    /**
     * Request permission and subscribe to push notifications
     */
    async subscribe(): Promise<boolean> {
        try {
            if (!this.registration) {
                const initialized = await this.init();
                if (!initialized) return false;
            }

            // Check if already subscribed
            const existingSubscription = await this.registration!.pushManager.getSubscription();
            if (existingSubscription) {
                this.subscription = existingSubscription;
                console.log('Already subscribed to push notifications');
                return true;
            }

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log('Notification permission denied');
                return false;
            }

            // Get VAPID public key from server
            const vapidResponse = await axios.get(`${API_URL}/api/push/vapid-public-key`, {
                headers: getAuthHeader()
            });

            if (!vapidResponse.data.configured) {
                console.log('Push notifications not configured on server');
                return false;
            }

            const publicKey = vapidResponse.data.publicKey;

            // Subscribe to push notifications
            this.subscription = await this.registration!.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(publicKey) as BufferSource
            });

            // Send subscription to server
            const subscriptionInfo: PushSubscriptionInfo = {
                endpoint: this.subscription.endpoint,
                keys: {
                    p256dh: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('p256dh')!))),
                    auth: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('auth')!)))
                }
            };

            await axios.post(
                `${API_URL}/api/push/subscribe`,
                { subscription: subscriptionInfo },
                { headers: getAuthHeader() }
            );

            console.log('Successfully subscribed to push notifications');
            return true;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            return false;
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe(): Promise<boolean> {
        try {
            if (!this.subscription) {
                const existingSubscription = await this.registration?.pushManager.getSubscription();
                if (existingSubscription) {
                    this.subscription = existingSubscription;
                }
            }

            if (this.subscription) {
                // Unsubscribe from browser
                await this.subscription.unsubscribe();

                // Notify server
                await axios.post(
                    `${API_URL}/api/push/unsubscribe`,
                    { endpoint: this.subscription.endpoint },
                    { headers: getAuthHeader() }
                );

                this.subscription = null;
                console.log('Successfully unsubscribed from push notifications');
            }

            return true;
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            return false;
        }
    }

    /**
     * Check if currently subscribed
     */
    async isSubscribed(): Promise<boolean> {
        try {
            if (!this.registration) {
                await this.init();
            }

            if (!this.registration) return false;

            const subscription = await this.registration.pushManager.getSubscription();
            this.subscription = subscription;
            return !!subscription;
        } catch (error) {
            console.error('Error checking subscription status:', error);
            return false;
        }
    }

    /**
     * Get permission status
     */
    getPermission(): NotificationPermission {
        return Notification.permission;
    }

    /**
     * Send test notification
     */
    async sendTestNotification(): Promise<boolean> {
        try {
            await axios.post(
                `${API_URL}/api/push/test`,
                {},
                { headers: getAuthHeader() }
            );
            return true;
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }

    /**
     * Convert VAPID public key to Uint8Array
     */
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();