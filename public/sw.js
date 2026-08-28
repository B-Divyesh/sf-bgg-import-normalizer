const CACHE = 'shelf-bridge-v4';
const SHELL = ['/bridge-mark.svg', '/apple-touch-icon.png', '/manifest.webmanifest', '/assets/notebook-bridge-560.webp', '/assets/notebook-bridge-960.webp', '/assets/notebook-bridge-960.avif', '/assets/notebook-bridge-960.jpg'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch('/');
    const html = await response.clone().text();
    await cache.put('/', response);
    const builtAssets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
      .map((match) => match[1])
      .filter((path) => path?.startsWith('/'));
    await cache.addAll([...new Set([...SHELL, ...builtAssets])]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    // Vite preview and some static hosts add `Vary: Origin`; module requests then
    // carry an Origin header that the install-time precache request did not.
    const cached = await caches.match(event.request, { ignoreVary: true });
    if (cached && event.request.mode !== 'navigate') return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
      return response;
    } catch {
      return cached || (event.request.mode === 'navigate' ? caches.match('/') : undefined);
    }
  })());
});
