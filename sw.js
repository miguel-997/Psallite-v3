const CACHE_NAME = "partitura-pwa-v15";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/partitura.html",
  "/manifest.json",
  "/partituras.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "https://cdn.jsdelivr.net/npm/opensheetmusicdisplay@1.8.6/build/opensheetmusicdisplay.min.js"
];

// Obtener TODAS las partituras desde partituras.json
async function getAllScores() {
  const res = await fetch("/partituras.json");
  const list = await res.json();
  const files = [];

  list.forEach(p => {
    const slug = p.slug;

    // original
    files.push(`/scores/${slug}/0.musicxml`);

    // transpuestas
    for (let i = 1; i <= p.maxUp; i++) {
      files.push(`/scores/${slug}/${i}.musicxml`);
    }
    for (let i = 1; i <= p.maxDown; i++) {
      files.push(`/scores/${slug}/-${i}.musicxml`);
    }
  });

  return files;
}

// INSTALACIÓN → precache TOTAL
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const scores = await getAllScores();
    await cache.addAll([...STATIC_FILES, ...scores]);
  })());
  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH → cache-first
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
