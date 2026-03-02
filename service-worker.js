// ✅ Auto cache version (no manual change needed)
const CACHE_NAME = "salary-sheet-" + Date.now();

// Files to cache first load
const urlsToCache = [
  "./",
  "./index.html",
  "./wallet.png"
];

// INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVATE → delete old caches automatically
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// ✅ NETWORK FIRST (always check update)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {

        // save latest version in cache
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));

        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
