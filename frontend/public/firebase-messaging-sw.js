// Firebase Messaging Service Worker
// This file must be placed at /public/firebase-messaging-sw.js
// It handles background push notifications.
//
// IMPORTANT: Keep Firebase SDK versions in sync with your app's firebase version.
// Replace the config object below with your actual Firebase project config.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Firebase config — replace with your actual values
// These are safe to include in the service worker (public key only, no server secrets)
const firebaseConfig = {
  apiKey:            self.__FIREBASE_API_KEY__     || '',
  authDomain:        self.__FIREBASE_AUTH_DOMAIN__ || '',
  projectId:         self.__FIREBASE_PROJECT_ID__  || '',
  storageBucket:     self.__FIREBASE_STORAGE_BUCKET__ || '',
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__ || '',
  appId:             self.__FIREBASE_APP_ID__      || '',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'GET YOUR JOB';
  const notificationOptions = {
    body:  payload.notification?.body || 'You have a new notification.',
    icon:  '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data:  payload.data,
    // Tag prevents duplicate notifications for the same event
    tag:   payload.data?.idempotencyKey || payload.messageId,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — navigate to the app route
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const route = event.notification.data?.route || '/notifications';
  const url = new URL(route, self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
