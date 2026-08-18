const CACHE_NAME = 'bwtools-v1-cache';
const STATIC_ASSETS = [
  '/',
  '/css/style.css',
  '/assets/js/bw-core.js',
  '/manifest.json'
];

const VENDOR_CDN_ORIGINS = [
  'https://cdn.jsdelivr.net',
  'https://cdnjs.cloudflare.com',
  'https://unpkg.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache-First strategy for external CDN libraries
  if (VENDOR_CDN_ORIGINS.some(origin => event.request.url.startsWith(origin))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-First with Stale Cache Fallback for site pages
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});