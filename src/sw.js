const CACHE_NAME = 'bwtools-cache-v1.0.2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/favicon.ico',
    '/manifest.json'
];

// 1. Install & Cache Shell Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. Activate & Purge Stale Cache Versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Fetch Strategy: Network-First for Navigation, Cache-First for Local Static Assets
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Bypass cross-origin requests, analytics, AdSense, and non-GET requests
    if (
        request.method !== 'GET' ||
        url.origin !== self.location.origin ||
        url.hostname.includes('cloudflareinsights.com') ||
        url.hostname.includes('googlesyndication.com') ||
        url.hostname.includes('google-analytics.com')
    ) {
        return;
    }

    // HTML Navigation Pages: Network-First (ensures instant homepage & tool template updates)
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(request).then((cachedResponse) => {
                        return cachedResponse || caches.match('/index.html');
                    });
                })
        );
        return;
    }

    // Local Static Assets (CSS, Icons, Fonts): Stale-While-Revalidate
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});