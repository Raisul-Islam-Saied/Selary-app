// ===== AUTO VERSION CACHE =====
const CACHE_NAME = "salary-sheet-" + Date.now();

const urlsToCache = [
  "./",
  "./index.html",
  "./wallet.png"
];

// ================= INSTALL =================
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ================= ACTIVATE =================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// ================= FETCH =================
self.addEventListener("fetch", event => {

  // ✅ HTML always NETWORK FIRST
  if (event.request.mode === "navigate") {

    event.respondWith(
      fetch(event.request)
        .then(response => {

          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, copy));

          return response;
        })
        .catch(() => caches.match(event.request))
    );

    return;
  }

  // ✅ Other files → Cache First
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        return cached || fetch(event.request);
      })
  );
});
