/* GAYA INFO TV — Service Worker v51
   Stratégie : stale-while-revalidate pour JS/CSS (rendu immédiat),
               network-first pour HTML (contenu toujours frais),
               cache-first pour images et fonts. */

const CACHE_STATIC = 'gaya-static-v51';
const CACHE_PAGES  = 'gaya-pages-v51';

// Assets statiques à précacher au premier install
const PRECACHE = [
  '/supabase-config.js',
  '/script.js',
  '/style.css',
  '/home-cms-bridge.js',
  '/home-latest-articles.js',
  '/emissions.js',
  '/emissions-cms.js',
  '/emissions.css',
  '/pwa-install.js',
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
  const req  = event.request;
  if (req.method !== 'GET') return;
  const url  = new URL(req.url);

  // Requêtes API Supabase : toujours réseau, jamais cache
  if (url.hostname.includes('supabase.co')) return;

  // Ressources externes (CDN) : stale-while-revalidate
  if (url.origin !== self.location.origin) {
    event.respondWith(staleWhileRevalidate(req, CACHE_STATIC));
    return;
  }

  const path = url.pathname;

  // HTML : network-first avec fallback cache (contenu toujours à jour)
  if (req.headers.get('accept')?.includes('text/html') || path.endsWith('/') || path.endsWith('.html')) {
    event.respondWith(networkFirstWithCache(req, CACHE_PAGES));
    return;
  }

  // JS et CSS : stale-while-revalidate (rendu immédiat, màj en arrière-plan)
  if (/\.(js|css)(\?.*)?$/.test(path)) {
    event.respondWith(staleWhileRevalidate(req, CACHE_STATIC));
    return;
  }

  // Images et fonts : cache-first (rarement changés)
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf)$/i.test(path)) {
    event.respondWith(cacheFirst(req, CACHE_STATIC));
    return;
  }
});

/* --- Stratégies --- */

// Stale-while-revalidate : répond depuis le cache immédiatement,
// met à jour le cache en arrière-plan pour la prochaine visite.
async function staleWhileRevalidate(req, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(req);
  const fetchProm = fetch(req).then(res => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || await fetchProm;
}

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

// Cache-first : répond depuis le cache, va en réseau seulement si absent.
async function cacheFirst(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}
