/* Service worker: permite usar el sitio sin conexión después de la primera visita.
   - Páginas, código y contenido (html, js, css, data/*.json): primero la red (siempre lo más nuevo);
     si no hay internet o tarda más de 4 s, se usa la copia guardada.
   - Fuentes e imágenes: primero la copia guardada (no cambian).
   Si agregas o renombras archivos, actualiza PRECACHE; si cambias la lógica de este archivo, sube la versión. */
const VERSION = 'boosters-v2';
const PRECACHE = [
  '/', '/index.html', '/a1.html', '/a2.html', '/b1.html', '/b2.html', '/c1.html', '/404.html',
  '/css/fonts.css', '/css/index.css', '/css/a1.css', '/css/a2.css', '/css/b1.css', '/css/b2.css', '/css/c1.css', '/css/a11y.css',
  '/js/engine.js', '/js/img-fallback.js', '/js/sw-register.js', '/js/index-menu.js', '/js/index-stage.js', '/js/a1.js', '/js/a2.js', '/js/b1.js', '/js/b2.js', '/js/c1.js',
  '/data/a1.json', '/data/a2.json', '/data/b1.json', '/data/b2.json', '/data/c1.json',
  '/fonts/inter-latin-wght-normal.woff2', '/fonts/plus-jakarta-sans-latin-wght-normal.woff2', '/fonts/jetbrains-mono-latin-wght-normal.woff2',
  '/fonts/montserrat-latin-wght-normal.woff2', '/fonts/poppins-latin-500-normal.woff2', '/fonts/poppins-latin-600-normal.woff2',
  '/fonts/poppins-latin-700-normal.woff2', '/fonts/poppins-latin-800-normal.woff2', '/fonts/lato-latin-400-normal.woff2', '/fonts/lato-latin-700-normal.woff2',
  '/images/logo.png', '/favicon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function networkFirst(req, ms) {
  return new Promise(resolve => {
    let done = false;
    const fallback = () => caches.match(req, { ignoreSearch: true }).then(hit => hit || offlinePage(req));
    const timer = setTimeout(() => { if (!done) { done = true; fallback().then(resolve); } }, ms);
    fetch(req, { cache: 'no-cache' }).then(res => {
      clearTimeout(timer);
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      if (!done) { done = true; resolve(res); }
      else if (res && res.ok) { /* llegó tarde: ya quedó guardada para la próxima */ }
    }).catch(() => { clearTimeout(timer); if (!done) { done = true; fallback().then(resolve); } });
  });
}
function offlinePage(req) {
  if (req.mode !== 'navigate') return Response.error();
  const p = new URL(req.url).pathname.replace(/\/$/, '');
  return caches.match(p + '.html').then(h => h || caches.match('/index.html')).then(h => h || Response.error());
}
function cacheFirst(req) {
  return caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    if (url.hostname === 'images.unsplash.com') e.respondWith(cacheFirst(req).catch(() => Response.error()));
    return;
  }
  if (url.pathname === '/sw.js') return;
  if (/^\/(fonts|images)\//.test(url.pathname)) e.respondWith(cacheFirst(req).catch(() => Response.error()));
  else e.respondWith(networkFirst(req, 4000));
});
