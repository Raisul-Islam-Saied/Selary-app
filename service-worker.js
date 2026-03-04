// ===============================
// SALARY APP FINAL SERVICE WORKER
// ===============================

// ✅ Manual version only when update needed
const CACHE_NAME = "salary-sheet-v1";


// ------------ INSTALL ------------
self.addEventListener("install", event => {
  self.skipWaiting();
});


// ------------ ACTIVATE ------------
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


// ------------ FETCH ------------
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // ✅ External API bypass
  if (url.origin !== location.origin) return;

  // ✅ NETWORK FIRST
  event.respondWith(
    fetch(event.request)
      .then(response => {

        const clone = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, clone));

        return response;
      })
      .catch(() => caches.match(event.request))
  );

});
