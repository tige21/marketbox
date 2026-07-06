import { useEffect, useState, type ImgHTMLAttributes } from 'react'

// Tiny data-URI SVG: dark card with a picture glyph.
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
      "<rect fill='%23151515' width='100' height='100'/>" +
      "<g fill='%234a4a4a' transform='translate(28 28)'>" +
        "<rect x='0' y='5' width='44' height='34' rx='4'/>" +
        "<circle cx='14' cy='17' r='4' fill='%23151515'/>" +
        "<path d='M4 37 L20 22 L30 30 L38 24 L42 39 Z' fill='%23151515'/>" +
      "</g>" +
    "</svg>",
  )

// Domains whose placeholder content we know is either broken (DNS-fails)
// or would cause a flash of unwanted content (visible text/colors).
// Bypassed at source so the browser never tries them.
const KNOWN_BAD_HOST = /^https?:\/\/(via\.placeholder\.com|placehold\.it|placeholder\.com)\//i

function isLikelyBroken(url: string | null | undefined): boolean {
  if (!url) return true
  return KNOWN_BAD_HOST.test(url)
}

// `cdn.marketandbox.ru` is unreliable / blocked on many UZ/RU networks
// (ERR_TIMED_OUT), while the same files are served from the main domain the
// app itself loads from. Rewrite the host so images come same-origin —
// reliable AND cacheable by our service worker.
function rewriteHost(url: string): string {
  return url.replace(
    /^(https?:)?\/\/cdn\.marketandbox\.ru\//i,
    'https://marketandbox.ru/',
  )
}

function resolveSrc(src: string | null | undefined, fallback: string): string {
  return isLikelyBroken(src) ? fallback : rewriteHost(src as string)
}

export interface BackendImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  /** URL from backend. Null / empty / blacklisted host → placeholder. */
  src: string | null | undefined
  /** Override the dark SVG placeholder if a section wants a themed one. */
  fallbackSrc?: string
}

/**
 * Drop-in `<img>` replacement for backend-sourced images.
 *
 *   • empty / null / blacklisted src  →  placeholder rendered immediately
 *   • valid URL → tries to load; on network error falls back to placeholder
 *   • resets on `src` change (locale switch) → no stale fallback
 *
 * Why the host blacklist: backend fixtures return URLs that either DNS-fail
 * or show a placeholder image with visible text. Rendering those once,
 * then swapping to the real placeholder, produced a visible two-step flicker
 * on slow connections. Pre-filtering the known-bad domains avoids that.
 */
export function BackendImage({
  src,
  fallbackSrc = PLACEHOLDER,
  alt = '',
  // `eager` by default: native lazy-loading is unreliable inside the iOS
  // Telegram WebView (WKWebView) — images in animated/off-screen containers
  // often never start loading. Callers that really need lazy can override.
  loading = 'eager',
  decoding = 'async',
  ...rest
}: BackendImageProps) {
  const target = resolveSrc(src, fallbackSrc)
  const [current, setCurrent] = useState(target)
  // Tracks whether we've already retried the current target, so a genuinely
  // dead image still falls back to the placeholder after one retry.
  const [retried, setRetried] = useState(false)

  // Resync when incoming prop changes (e.g. language switch).
  useEffect(() => {
    setCurrent(target)
    setRetried(false)
  }, [target])

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={() => {
        if (current === fallbackSrc) return
        if (!retried) {
          // First failure (often a stalled/aborted load in WKWebView) — retry
          // once with a cache-buster before giving up to the placeholder.
          setRetried(true)
          setCurrent(`${target}${target.includes('?') ? '&' : '?'}r=${Date.now()}`)
        } else {
          setCurrent(fallbackSrc)
        }
      }}
    />
  )
}
