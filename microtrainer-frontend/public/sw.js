/**
 * Service Worker for Push Notifications
 * 
 * Handles background push notifications and notification clicks
 */

// Service worker version
const VERSION = '1.0.0';

// Install event
self.addEventListener('install', (_event) => {
  console.log(`Service Worker ${VERSION} installing...`);
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log(`Service Worker ${VERSION} activated`);
  event.waitUntil(clients.claim());
});

// Push event - receive push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let data = {
    title: 'MicroTrainer',
    body: 'You have a new notification',
    icon: '/notification-icon.png',
    badge: '/notification-icon.png',
    tag: 'microtrainer-notification',
    requireInteraction: false
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    data: {
      url: data.url || '/',
      ...data.data
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync (optional - for offline support)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'sync-engagement') {
    event.waitUntil(syncEngagementData());
  }
});

async function syncEngagementData() {
  // Sync any pending engagement data when back online
  console.log('Syncing engagement data...');
  // Implementation would go here
}
