const VERSION = 'zakatmaal-v5-2026-08-11-local-assistant';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/splash-portrait.png',
  './assets/splash-landscape.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  // HTML/navigation: network-first for automatic updates, cache fallback for offline.
  if(req.mode === 'navigate' || req.destination === 'document'){
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy=res.clone();
          caches.open(VERSION).then(cache=>cache.put('./index.html',copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Local assets: cache-first for fast offline loading.
  if(new URL(req.url).origin === self.location.origin){
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(VERSION).then(cache=>cache.put(req,copy));
        return res;
      }))
    );
  }
});
