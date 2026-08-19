const CACHE_NAME = 'bwtools-cache-v1.0.3';
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

// 2. Activate & Purge Stale Caches Immediately
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

// 3. Robust Fetch Handler
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Early bailout: Only handle same-origin GET requests
    if (request.method !== 'GET') return;

    let url;
    try {
        url = new URL(request.url);
    } catch {
        return;
    }

    // Ignore cross-origin scripts, Cloudflare insights, AdSense, and browser extensions
    if (
        url.origin !== self.location.origin ||
        !url.protocol.startsWith('http') ||
        url.hostname.includes('cloudflareinsights.com') ||
        url.hostname.includes('googlesyndication.com') ||
        url.hostname.includes('google-analytics.com')
    ) {
        return;
    }

    // HTML Navigation: Network-First with Cache Fallback
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
                .catch(async () => {
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) return cachedResponse;
                    
                    const fallback = await caches.match('/index.html');
                    return fallback || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                })
        );
        return;
    }

    // Static Assets: Stale-While-Revalidate
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