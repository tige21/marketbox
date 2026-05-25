import { useEffect } from 'react'

// Features most users tap into right after Home — pre-fetching their chunks
// while the main thread is idle makes the first tab-tap feel instant on
// repeat visits, and shaves several seconds off the first one on slow
// networks (the chunk arrives in the background before the user asks for it).
const PREFETCH_FACTORIES: Array<() => Promise<unknown>> = [
  () => import('@/features/cargo'),
  () => import('@/features/courses'),
  () => import('@/features/factories'),
  () => import('@/features/chinaGuide'),
]

interface NetworkInformation {
  effectiveType?: string
  saveData?: boolean
}

function isWorthPrefetching(): boolean {
  if (typeof navigator === 'undefined') return false
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (!conn) return true // no info → assume reasonable network
  if (conn.saveData) return false
  if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return false
  return true
}

type IdleHandle = number
type IdleScheduler = (cb: () => void) => IdleHandle
type IdleCanceller = (handle: IdleHandle) => void

function getScheduler(): { schedule: IdleScheduler; cancel: IdleCanceller } {
  const w = window as Window & {
    requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number
    cancelIdleCallback?: (handle: number) => void
  }
  if (w.requestIdleCallback && w.cancelIdleCallback) {
    return {
      schedule: (cb) => w.requestIdleCallback!(() => cb(), { timeout: 5000 }),
      cancel: (h) => w.cancelIdleCallback!(h),
    }
  }
  return {
    schedule: (cb) => window.setTimeout(cb, 1500),
    cancel: (h) => window.clearTimeout(h),
  }
}

export function useIdlePrefetch(): void {
  useEffect(() => {
    if (!isWorthPrefetching()) return
    const { schedule, cancel } = getScheduler()
    const handles = PREFETCH_FACTORIES.map((factory) =>
      schedule(() => {
        factory().catch(() => undefined)
      }),
    )
    return () => {
      handles.forEach((h) => cancel(h))
    }
  }, [])
}
