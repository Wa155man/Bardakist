const CACHE_NAME = 'zoharon-v1';
const DYNAMIC_CACHE_NAME = 'zoharon-dynamic-v1';

const STATIC_ASSETS = [ '/', '/index.html', '/index.tsx', 'https://cdn.tailwindcss.com' ];

self.addEventListener('install', (event) => {
  event.waitUntil( caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)) );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil( caches.keys().then((keys) => Promise.all( keys.map((key) => { if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) return caches.delete(key); }) )) );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith( caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.match(event.request).then((response) => response || fetch(event.request).then((fetchRes) => { cache.put(event.request, fetchRes.clone()); return fetchRes; }) )) );
    return;
  }

  if (url.hostname === 'image.pollinations.ai') {
    event.respondWith( caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.match(event.request).then((response) => {
        if (response) return response;
        return fetch(event.request).then((fetchRes) => {
            if (fetchRes.status === 200) cache.put(event.request, fetchRes.clone());
            return fetchRes;
        }).catch(() => new Response('', { status: 404 }));
    })) );
    return;
  }

  event.respondWith( caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (event.request.method === 'GET' && networkResponse.status === 200) {
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => {});
      return cachedResponse || fetchPromise;
    })
  );
});
