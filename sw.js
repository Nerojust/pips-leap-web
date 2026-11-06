// Offline support for the installed web app.
// Every file the game loads from this site is kept in a cache. The page itself is fetched fresh
// whenever there's a connection, so an update shows on the next load; the cached copy is the
// fallback offline. Everything else (code, art, fonts: their names change with their content)
// comes from the cache at once, with a fresh copy fetched in the background.
// The build (vite.config.ts) fills in the version and the list of every file, so the whole game
// is stored on the first visit and each release gets a fresh cache (older ones are deleted).
const CACHE = 'pips-leap-1.0.1-5e7083cc';
const FILES = ["./","./index.html","./loader.js","./manifest.webmanifest","./page.css","./privacy.html","./support.html","./assets/consent-status.enum-CdMsqkrY.js","./assets/definitions-BdWVgBTV.js","./assets/dist-CxclIdbR.js","./assets/dist-WmVykzCl.js","./assets/fredoka-hebrew-500-normal-BtShCMVp.woff","./assets/fredoka-hebrew-500-normal-DdMTjgiE.woff2","./assets/fredoka-hebrew-600-normal-BiVDObXj.woff","./assets/fredoka-hebrew-600-normal-CTBxhdlE.woff2","./assets/fredoka-latin-500-normal-B0JifZgm.woff2","./assets/fredoka-latin-500-normal-BL692wg7.woff","./assets/fredoka-latin-600-normal-C4zohCW5.woff2","./assets/fredoka-latin-600-normal-CcrEjrB4.woff","./assets/index-BE3YuFSx.js","./assets/index-BHZKIcE1.css","./assets/web-B_8c8xfk.js","./assets/web-CP-JMXCX.js","./assets/web-CmxrZmOa.js","./assets/web-D580glcS.js","./assets/web-DMv5zD8O.js","./assets/web-Dq0TPAkx.js","./assets/web-Dtog8Y8Q.js","./assets/window-CTbE_3ou.js","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const page = request.mode === 'navigate';
      const cached = await cache.match(request, { ignoreSearch: page });
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) void cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached ?? Response.error());
      return page ? fresh : (cached ?? fresh);
    }),
  );
});
