/* GAYA INFO TV — Service Worker v50
   Objectif : éviter les anciens caches Chrome pendant les mises à jour CMS. */
const CACHE_NAME = 'gaya-pwa-v50-no-stale';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // HTML, JS, CSS, JSON : toujours réseau, jamais ancien cache.
  const accept = req.headers.get('accept') || '';
  const freshAsset = accept.includes('text/html') || /\.(js|css|json|xml)$/i.test(url.pathname);
  if (freshAsset) {
    event.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match(req)));
    return;
  }

  // Images : réseau puis cache de secours.
  event.respondWith(
    fetch(req).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
      return res;
    }).catch(() => caches.match(req))
  );
});
