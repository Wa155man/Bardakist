const CACHE_NAME = 'zoharon-v1';
const DYNAMIC_CACHE_NAME = 'zoharon-dynamic-v1';

// Assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  'https://cdn.tailwindcss.com',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Handle Google Fonts (Cache First)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((fetchRes) => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        });
      })
    );
    return;
  }

  // 2. Handle Pollinations Images (Cache First, fall back to network)
  // We cache images so the "game visuals" work offline after being loaded once
  if (url.hostname === 'image.pollinations.ai') {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) return response;
          return fetch(event.request).then((fetchRes) => {
            // Only cache successful responses
            if (fetchRes.status === 200) {
                cache.put(event.request, fetchRes.clone());
            }
            return fetchRes;
          }).catch(() => {
             // If offline and image missing, return nothing (App has fallback UI)
             return new Response('', { status: 404 });
          });
        });
      })
    );
    return;
  }

  // 3. Default Strategy: Stale-While-Revalidate for app shell, Network First for others
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (event.request.method === 'GET' && networkResponse.status === 200) {
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
            });
        }
        return networkResponse;
      }).catch(() => {
          // If offline and no cache, we can't do much for dynamic data, 
          // but the App logic handles offline via constants.ts fallbacks.
      });

      return cachedResponse || fetchPromise;
    })
  );
});