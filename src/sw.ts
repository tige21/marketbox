/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

// Service worker for the MarketBox Mini App. Cache strategy:
//   • static assets (css/img/fonts/svg) — cache-first, immutable hashed files
//   • JS module chunks                  — cache-first
//   • locale JSONs                      — stale-while-revalidate
//   • index.html / navigations          — network-first, fall back to cache when offline
//   • /api/*                            — bypass (handled by React Query persistence + axios)
// Old caches are evicted on each new app version.

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string } | string> }
declare const APP_VERSION: string

const manifest = self.__WB_MANIFEST || []

// App is served from /app/ — every request URL the SW sees is prefixed with it.
const BASE = '/app/'
const INDEX_URL = `${BASE}index.html`
const CACHE_VERSION = APP_VERSION || '0.0.0'

const STATIC_CACHE = `static-${CACHE_VERSION}`
const MODULE_CACHE = `modules-${CACHE_VERSION}`
const LOCALE_CACHE = `locales-${CACHE_VERSION}`
const HTML_CACHE = `html-${CACHE_VERSION}`

const STATIC_ASSETS = /\.(css|png|jpg|jpeg|svg|webp|avif|woff2?|ttf|ico|gif)$/i
const JS_MODULE = /\.js$/i
const LOCALE_JSON = /\/locales\/[^/]+\/[^/]+\.json$/i

function isValidResponse(response: Response | undefined): response is Response {
  return !!response && response.status === 200 && response.type === 'basic'
}

function logError(message: string, error?: unknown): void {
  console.error('[SW]', message, error || '')
}

function isSameOrigin(url: string): boolean {
  try {
    return new URL(url, self.location.origin).origin === self.location.origin
  } catch {
    return false
  }
}

// ─── install: pre-cache hashed static assets from the workbox manifest ──────
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const urls = new Set<string>([INDEX_URL, `${BASE}favicon.svg`])
      manifest.forEach((entry) => {
        const url = typeof entry === 'string' ? entry : entry.url
        if (STATIC_ASSETS.test(url)) urls.add(url)
      })
      try {
        await cache.addAll([...urls])
      } catch (err) {
        logError('cache.addAll failed', err)
      }
    }),
  )
})

// ─── activate: evict caches from previous deploys ───────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      const current = new Set([STATIC_CACHE, MODULE_CACHE, LOCALE_CACHE, HTML_CACHE])
      await Promise.all(keys.filter((k) => !current.has(k)).map((k) => caches.delete(k)))
      await self.clients.claim()
    }),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// ─── fetch: route by URL ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event

  if (!isSameOrigin(request.url)) return
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // API — bypass entirely. React Query handles caching at the data layer,
  // and we never want the SW to serve stale auth/user data.
  if (url.pathname.startsWith('/api/')) return

  // Navigations / index.html → network-first with cache fallback. Fresh
  // index ensures hashed assets resolve to the latest deploy; cache lets
  // the app open offline.
  const isNavigate = request.mode === 'navigate'
  const isIndex = url.pathname === INDEX_URL || url.pathname === BASE
  if (isNavigate || isIndex) {
    event.respondWith(networkFirst(request, HTML_CACHE, INDEX_URL))
    return
  }

  // Locale JSONs change occasionally — stale-while-revalidate gives instant
  // UI while quietly refreshing in the background.
  if (LOCALE_JSON.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, LOCALE_CACHE))
    return
  }

  // Hashed JS modules — cache-first; same file URL = same content.
  if (JS_MODULE.test(url.pathname)) {
    event.respondWith(cacheFirst(request, MODULE_CACHE))
    return
  }

  // Static assets — cache-first.
  if (STATIC_ASSETS.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }
})

async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (isValidResponse(res)) {
      const cloned = res.clone()
      caches.open(cacheName).then((c) => c.put(request, cloned)).catch(() => undefined)
    }
    return res
  } catch (err) {
    logError('cacheFirst fetch failed', err)
    return Response.error()
  }
}

async function networkFirst(
  request: Request,
  cacheName: string,
  fallbackUrl: string,
): Promise<Response> {
  try {
    const res = await fetch(request)
    if (isValidResponse(res)) {
      const cloned = res.clone()
      caches.open(cacheName).then((c) => c.put(fallbackUrl, cloned)).catch(() => undefined)
    }
    return res
  } catch {
    const cached = (await caches.match(fallbackUrl)) || (await caches.match(request))
    if (cached) return cached
    return Response.error()
  }
}

async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cached = await caches.match(request)
  const networkPromise = fetch(request)
    .then((res) => {
      if (isValidResponse(res)) {
        const cloned = res.clone()
        caches.open(cacheName).then((c) => c.put(request, cloned)).catch(() => undefined)
      }
      return res
    })
    .catch(() => undefined)
  return cached || (await networkPromise) || Response.error()
}
