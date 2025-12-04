
const CACHE_NAME = 'bardakist-v1';
const DYNAMIC_CACHE_NAME = 'bardakist-dynamic-v1';

// Assets to pre-cache (using relative paths for robustness)
const STATIC_ASSETS = [
  './', 
  './index.html',
  // Removed explicit JS/TS file references to prevent caching errors in build environments.
  // The service worker will cache assets dynamically as they are fetched.
  'https://cdn.tailwindcss.com',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
        console.error('Failed to pre-cache assets:', err);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Strategy: Cache, falling back to network.
    // This is robust for offline use.
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // If the resource is in the cache, return it.
            if (cachedResponse) {
                return cachedResponse;
            }

            // If it's not in the cache, fetch it from the network.
            return fetch(event.request).then((networkResponse) => {
                // For valid GET requests, cache the new response for future offline use.
                if (event.request.method === 'GET' && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(error => {
                console.warn('Network request failed for:', event.request.url);
                throw error;
            });
        })
    );
});
