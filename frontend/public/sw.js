// Service Worker for Push Notifications
// Place this file at: frontend/public/sw.js

// Install event
self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Push event - receives notification from server
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received:', event);

    if (!event.data) {
        console.log('[SW] Push event has no data');
        return;
    }

    try {
        const data = event.data.json();
        console.log('[SW] Push notification data:', data);

        const options = {
            body: data.body,
            icon: data.icon || '/icon-192x192.png',
            badge: data.badge || '/badge-72x72.png',
            tag: data.tag,
            data: data.data,
            requireInteraction: false,
        };

        console.log('[SW] Showing notification with options:', options);

        self.registration.showNotification(data.title, options);
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
                .then(() => {
                    console.log('[SW] ✓ Notification displayed successfully');
                })
                .catch((error) => {
                    console.error('[SW] ✗ Failed to show notification:', error);
                })
        );
    } catch (error) {
        console.error('[SW] Error handling push notification:', error);
    }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);

    event.notification.close();

    const data = event.notification.data;
    const noteId = data?.noteId;

    if (noteId) {
        const urlToOpen = new URL(`/notes?view=${noteId}`, self.location.origin).href;
        console.log('[SW] Opening URL:', urlToOpen);

        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if there's already a window open
                    for (const client of clientList) {
                        if (client.url === urlToOpen && 'focus' in client) {
                            console.log('[SW] Focusing existing window');
                            return client.focus();
                        }
                    }
                    // If not, open a new window
                    if (self.clients.openWindow) {
                        console.log('[SW] Opening new window');
                        return self.clients.openWindow(urlToOpen);
                    }
                })
        );
    }
});

// Notification close event (optional)
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed:', event);
});