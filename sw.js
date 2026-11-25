// ==========================================
// SERVICE WORKER: 100% OFFLINE APP SUPPORT
// ==========================================

const CACHE_NAME = 'world-runner-360-v1';
const ASSETS_TO_CACHE = Array.of(
  './',
  './index.html',
  './privacy.html',
  './manifest.json',
  './icon.svg',
  './css/style.css',
  './js/three.min.js',
  './js/data.js',
  './js/storage.js',
  './js/audio.js',
  './js/ads.js',
  './js/install.js',
  './js/ui.js',
  './js/game.js'
);

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Always check Vercel for newest updates first; fall back to offline cache if no internet
  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
