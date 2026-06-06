/* ============================================================
   GAYA INFO TV — Service Worker PWA v1.0
   Cache-first pour les assets statiques,
   Network-first pour les pages HTML (contenu frais).
   ============================================================ */

const CACHE_NAME = 'gaya-pwa-v7-don';
const CACHE_STATIC = 'gaya-static-v7-don';

/* Assets à mettre en cache dès l'installation */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/actualites.html',
  '/live.html',
  '/emissions.js',
  '/multimedia.html',
  '/societe.html',
  '/sport.html',
  '/economie.html',
  '/religion.html',
  '/faitsdivers.html',
  '/apropos.html',
  '/contact.html',
  '/style.css?v=16',
  '/script.js?v=18',
  '/emissions.css',
  '/favicon-192x192.png',
  '/favicon-512x512.png',
  '/favicon-32x32.png',
  '/favicon.ico',
  '/logo-gaya.jpg',
  '/gaya.jpg',
  '/manifest.json'
];

/* ---- Installation : précache les assets essentiels ---- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

/* ---- Activation : nettoie les anciens caches ---- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_STATIC && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ---- Fetch : stratégie selon le type de requête ---- */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Ignorer les requêtes non-GET et externes (Firebase, fonts...) */
  if (request.method !== 'GET') return;
  if (!url.origin.includes(self.location.hostname) &&
      !url.hostname.endsWith('googleapis.com') &&
      !url.hostname.endsWith('gstatic.com') &&
      !url.hostname.endsWith('cloudflare.com')) return;

  /* Pages HTML → Network-first (contenu toujours frais) */
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  /* Assets (CSS, JS, images) → Cache-first */
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_STATIC).then(cache => cache.put(request, clone));
        return response;
      });
    })
  );
});

/* ---- Notification push (prêt pour usage futur) ---- */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'GAYA INFO TV', {
    body: data.body || '',
    icon: '/favicon-192x192.png',
    badge: '/favicon-32x32.png',
    data: { url: data.url || '/' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
