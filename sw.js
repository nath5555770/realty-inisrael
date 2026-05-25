/* ==========================================================================
   SHAHAR LEVI REAL ESTATE — Service Worker
   Stratégie : network-first pour HTML (fraîcheur des annonces), cache-first
   pour assets statiques (CSS/JS/images). Offline fallback sur la home.
   ========================================================================== */

const CACHE_VERSION = 'sl-v14-2026-05-25-multiline-desc';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Ressources critiques mises en cache à l'install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/portefeuille.html',
  '/agence.html',
  '/journal.html',
  '/contact.html',
  '/honoraires.html',
  '/404.html',
  '/assets/i18n.js',
  '/assets/animations.js',
  '/assets/animations.css',
  '/assets/listings.js',
  '/assets/journal.js',
  '/assets/agency.js',
  '/assets/site.webmanifest',
  '/assets/favicon.svg',
  '/assets/favicon-192.png',
  '/assets/favicon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(() => {
        // Ne pas planter l'install si un asset manque
        return Promise.all(STATIC_ASSETS.map(a => cache.add(a).catch(() => null)));
      }))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => !k.startsWith(CACHE_VERSION)).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes non-GET ou cross-origin (Supabase, CDN…)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // HTML pages : network-first (toujours essayer le réseau, fallback cache)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, copy));
          return resp;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Assets : cache-first (rapide), réseau en fallback
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, copy));
        }
        return resp;
      });
    })
  );
});
