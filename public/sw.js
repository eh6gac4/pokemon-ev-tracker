const CACHE = 'pokelog-v2';
const FONT_CACHE = 'pokelog-fonts-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE && k !== FONT_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

const putInCache = (cacheName, req, res) =>
  caches.open(cacheName).then(c => c.put(req, res)).catch(() => {});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Google Fonts: stale-while-revalidate (cross-origin, opaque OK)
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONT_CACHE).then(c =>
        c.match(req).then(hit => {
          const fetchPromise = fetch(req).then(res => {
            c.put(req, res.clone()).catch(() => {});
            return res;
          }).catch(() => hit);
          return hit || fetchPromise;
        })
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // API: always network (do not cache)
  if (url.pathname.startsWith('/api/')) return;

  // /assets/* : cache-first (immutable hashed filenames)
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          e.waitUntil(putInCache(CACHE, req, clone));
        }
        return res;
      }))
    );
    return;
  }

  // HTML / icons / manifest: network-first, fallback to cache, then offline.html
  const isHTML = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').includes('text/html');

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          e.waitUntil(putInCache(CACHE, req, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => {
          if (hit) return hit;
          if (isHTML) return caches.match('/offline.html');
          return new Response('', { status: 504, statusText: 'Offline' });
        })
      )
  );
});
