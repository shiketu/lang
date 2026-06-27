/* Minimal, conservative service worker for the LangLearn PWA.
 * - Never caches API / auth responses.
 * - Cache-first only for immutable hashed assets and icons.
 * - Network-first for navigations, falling back to an offline page.
 * Bump VERSION to invalidate old caches.
 */
const VERSION = "v1";
const STATIC_CACHE = `langlearn-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Leave cross-origin (YouTube, S3 videos, Clerk) untouched.
  if (url.origin !== self.location.origin) return;
  // Never cache API / auth-bearing data.
  if (url.pathname.startsWith("/api/")) return;

  // Immutable hashed build assets + app icons → cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
    return;
  }

  // Page navigations → network-first (never serve stale HTML), offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
    return;
  }
});
