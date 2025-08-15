/// <reference lib="WebWorker" />
import { precacheAndRoute } from 'workbox-precaching';

// ✅ Precache files if Workbox manifest is available
precacheAndRoute(self.__WB_MANIFEST || []);

// ✅ Push Event Listener
self.addEventListener('push', (event) => {
  console.log("✅ Push event received:", event.data ? event.data.text() : 'No data');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('❌ Failed to parse push data:', e);
  }

  const title = data.title || 'New Notification';
  const options = {
    body: data.body || 'You have a new message!',
    icon: data.icon || '/img/Logo-NexCard-192x192.png',
    badge: data.badge || '/img/Logo-NexCard-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      ...data // Keep any extra info from push payload
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ✅ Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  console.log('✅ Notification clicked, opening:', url);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// ✅ Background Sync Event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil((async () => {
      console.log('✅ Background sync triggered');
      // Add actual sync logic here (e.g., resend failed requests)
    })());
  }
});
