// ✅ Auto cache version (no manual change needed)
const CACHE_NAME = "salary-sheet-" + Date.now();

// Files to cache first load
const urlsToCache = [
  "./",
  "./index.html",
  "./wallet.png"
];

// ---------- INSTALL ----------
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ---------- ACTIVATE ----------
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

// ---------- FETCH ----------
self.addEventListener("fetch", event => {

  const request = event.request;
  const url = new URL(request.url);

  // ✅ external request cache করবে না
  if (url.origin !== location.origin) return;

  // ✅ HTML always network → update fix
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // ✅ static file cache only
  event.respondWith(
    fetch(request)
      .then(networkResponse => {

        // only cache css/js/image
        if (
          request.destination === "style" ||
          request.destination === "script" ||
          request.destination === "image"
        ) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, clone));
        }

        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
