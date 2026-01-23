// Service Worker for Push Notifications
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Push event - receives notification from server
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    if (!event.data) {
        console.log('Push event has no data');
        return;
    }

    try {
        const data = event.data.json();
        console.log('Push notification data:', data);

        const options: NotificationOptions = {
            body: data.body,
            icon: data.icon || '/icon-192x192.png',
            badge: data.badge || '/badge-72x72.png',
            tag: data.tag,
            data: data.data,
            requireInteraction: false,
            // vibrate: [200, 100, 200],
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (error) {
        console.error('Error handling push notification:', error);
    }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    const data = event.notification.data;
    const noteId = data?.noteId;

    if (noteId) {
        const urlToOpen = new URL(`/notes?view=${noteId}`, self.location.origin).href;

        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if there's already a window open
                    for (const client of clientList) {
                        if (client.url === urlToOpen && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // If not, open a new window
                    if (self.clients.openWindow) {
                        return self.clients.openWindow(urlToOpen);
                    }
                })
        );
    }
});

// Notification close event (optional)
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event);
});

export {};