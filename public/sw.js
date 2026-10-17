// DROBE Service Worker - v2 (Bypass Cache for HTML Navigation)
const CACHE_NAME = 'drobe-pwa-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch fresh network for HTML navigation to ensure live holding screen renders immediately
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Normal network-first for other requests
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
