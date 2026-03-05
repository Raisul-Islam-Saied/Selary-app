// ===============================
// SALARY APP OFFLINE SERVICE WORKER
// ===============================

// 🔁 Version change করলে নতুন cache হবে
const CACHE_NAME = "salary-sheet-v3";

// 📦 Cache করার সব ফাইল
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/wallet.png",
  "/service-worker.js"
];


// ------------ INSTALL ------------
self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(FILES_TO_CACHE);
      })
  );

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

  event.respondWith(

    caches.match(event.request)
      .then(response => {

        // যদি cache থাকে
        if (response) {
          return response;
        }

        // না থাকলে network
        return fetch(event.request)
          .then(networkResponse => {

            const clone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clone));

            return networkResponse;

          });

      })

  );

});
