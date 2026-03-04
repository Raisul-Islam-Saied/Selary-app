// ===============================
// SUPER FAST SERVICE WORKER
// Strategy: Stale-While-Revalidate
// ===============================

const CACHE_NAME = "salary-sheet-v3"; // নতুন আপডেট দিলে v4, v5 করবেন

// ------------ INSTALL ------------
self.addEventListener("install", event => {
  self.skipWaiting(); // দ্রুত ইন্সটল হওয়ার জন্য
});

// ------------ ACTIVATE ------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // পুরোনো ক্যাশ ডিলিট করে জায়গা খালি করবে
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ------------ FETCH (SUPER FAST STRATEGY) ------------
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // Stale-While-Revalidate Strategy
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      
      // ব্যাকগ্রাউন্ডে নেটওয়ার্ক থেকে নতুন ডেটা আনবে এবং ক্যাশ আপডেট করবে
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // অফলাইনে থাকলে কোনো এরর দেখাবে না
      });

      // যদি ক্যাশে ফাইল থাকে, সাথে সাথে দিয়ে দেবে (Instant Load)। 
      // না থাকলে ইন্টারনেট থেকে আনবে।
      return cachedResponse || fetchPromise;
    })
  );
});
