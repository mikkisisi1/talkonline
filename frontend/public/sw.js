// Service Worker for TalkMe PWA
// Bump this when changing SW behavior to force clients to pick up the new worker.
const CACHE_NAME = 'talkme-v5';

self.addEventListener('install', (event) => {
  // Activate the updated worker immediately.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  

  event.waitUntil((async () => {
    // Clean up any old caches from previous versions.
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith('talkme-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );

    await clients.claim();
  })());
});

// Fetch event - network first, but avoid serving stale resources from HTTP cache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .catch(() => caches.match(event.request))
  );
});

