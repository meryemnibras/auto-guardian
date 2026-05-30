/* AI DriveX — minimal offline-first service worker.
 * Strategy:
 *   - Same-origin GET requests: stale-while-revalidate against a versioned cache.
 *   - API requests (/api/*): network-only; we never want stale AI responses.
 *   - Anything else: pass through.
 * Bump CACHE_VERSION when you ship a deploy that must invalidate cached assets.
 */

const CACHE_VERSION = "ai-drivex-v1";
const APP_SHELL = [
  "/",
  "/diagnostics",
  "/wallet",
  "/emergency",
  "/ai-test",
  "/settings",
  "/manifest.webmanifest",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // Best-effort: any 404 or transient failure shouldn't abort install.
      Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch(() => undefined)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle same-origin GET requests.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Bypass HMR, Next internals, and API routes (never cache LLM responses).
  if (
    url.pathname.startsWith("/_next/data") ||
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Stale-while-revalidate for navigations and static assets.
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          // Cache only successful responses.
          if (response.ok && response.status === 200) {
            cache.put(request, response.clone()).catch(() => undefined);
          }
          return response;
        })
        .catch(() => cached);

      return cached ?? network;
    })
  );
});
