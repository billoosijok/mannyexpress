// Source of the service worker. The build stamps the version and the list of
// files it just produced into it and writes the result to `dist/sw.js` — see
// the serviceWorker() plugin in vite.config.js. Editing `dist/sw.js` by hand
// achieves nothing; edit this file.

const CACHE = "manny-visites-__VERSION__";
const PRECACHE = __PRECACHE__;

self.addEventListener("install", (event) => {
  // Deliberately no skipWaiting(): a new version must never replace the
  // running one while a surveyor is halfway through a form. It waits until
  // the app is next opened, or until the update banner is tapped.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// Sent by the update banner when the user chooses to switch over now.
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Firestore, Storage and the photos hosted there are left untouched: they
  // carry live data, and the Firestore SDK keeps its own offline cache.
  if (new URL(request.url).origin !== self.location.origin) return;

  // The shell is served from the network when there is one, so a deployment
  // is picked up on the next launch, and from the cache when there is not.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/index.html").then((cached) => cached || caches.match("/"))
      )
    );
    return;
  }

  // Everything else the app ships is content-hashed, so a cached copy can
  // never be stale: a new build asks for new file names.
  //
  // Matched on the URL rather than the request itself: reloading a page marks
  // its subresource requests "reload", and those never match a cache entry —
  // the app would then go looking for its own script over a network that is
  // not there.
  event.respondWith(
    caches.match(request.url).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request.url, copy));
        }
        return response;
      });
    })
  );
});
