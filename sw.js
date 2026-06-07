/* GAYA INFO TV — Service Worker v53
   Stratégie : network-first pour HTML + JS/CSS (contenu toujours frais),
               cache-first pour images/fonts/icônes (assets immuables),
               bypass total pour Supabase. */

const CACHE_STATIC = 'gaya-static-v53';
const CACHE_PAGES  = 'gaya-pages-v53';

// Seuls les assets vraiment immuables sont précachés
const PRECACHE = [
  '/favicon-192x192.png',
  '/favicon-512x512.png',
  '/favicon-32x32.png',
  '/favicon.ico',
  '/gaya.jpg',
  '/manifest.json',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => cache.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_STATIC && k !== CACHE_PAGES).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Requêtes Supabase : toujours réseau, jamais cache
  if (url.hostname.includes('supabase.co')) return;

  // Ressources tierces (CDN fonts, icons) : cache-first (immuables)
  if (url.origin !== self.location.origin) {
    event.respondWith(cacheFirst(req, CACHE_STATIC));
    return;
  }

  const path = url.pathname;

  // Pages HTML : network-first
  if (req.headers.get('accept')?.includes('text/html') || path.endsWith('/') || path.endsWith('.html')) {
    event.respondWith(networkFirstWithCache(req, CACHE_PAGES));
    return;
  }

  // JS et CSS : network-first (pour avoir toujours le code à jour)
  if (/\.(js|css)(\?.*)?$/i.test(path)) {
    event.respondWith(networkFirstWithCache(req, CACHE_STATIC));
    return;
  }

  // Images, fonts, icônes : cache-first (assets immuables, gain perf)
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf)(\?.*)?$/i.test(path)) {
    event.respondWith(cacheFirst(req, CACHE_STATIC));
    return;
  }
});

/* --- Stratégies --- */

// Network-first : essaie le réseau, tombe en cache si hors-ligne.
async function networkFirstWithCache(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch(_) {
    return await cache.match(req);
  }
}

// Cache-first : répond depuis le cache immédiatement, va en réseau seulement si absent.
async function cacheFirst(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch(_) {
    return cached;
  }
}

/* ---- Notifications push ---- */
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
