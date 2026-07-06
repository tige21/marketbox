import { useEffect, useRef, useState } from 'react'

interface PullToRefreshOptions {
  /**
   * Async callback invoked once when the pull crosses `threshold` and the
   * finger lifts. The indicator stays parked at threshold until the
   * promise settles.
   */
  onRefresh: () => Promise<unknown> | void
  /**
   * CSS selector for the element that scrolls. Defaults to the AppLayout
   * scroller (`.app-layout__main`). Pass a different selector if a page
   * mounts its own scroll container.
   */
  scrollerSelector?: string
  /** Minimum visual pull (px) needed to trigger refresh. Default 80. */
  threshold?: number
  /**
   * Multiplier applied to the raw finger delta to compute the visual
   * pull distance. <1 makes triggering harder (and feels iOS-like).
   * Default 0.5 — user must drag finger ~160px to reach the 80px
   * trigger, which is enough to reject incidental scroll-bounce.
   */
  dampening?: number
  /** Maximum visual pull (px). Default 120. */
  maxPull?: number
  /** Disables the gesture (e.g. while data still loading). */
  enabled?: boolean
}

/**
 * iOS-style pull-to-refresh.
 *
 * Performance note: the pull distance is applied directly to the DOM
 * (indicator height, content transform, spinner opacity/rotation) inside
 * the touch handlers — it is NOT React state. Driving a `translateY` from
 * `useState` re-rendered the entire page subtree (including the framer-motion
 * `layout` list) on every touchmove frame. Only `isRefreshing` — which flips
 * at most twice per gesture — lives in state.
 *
 * Attach the returned refs:
 *   - `indicatorRef` → the element whose height grows with the pull
 *   - `contentRef`   → the element that translates down with the pull
 *   - `spinnerRef`   → the spinner (opacity + rotation feedback)
 */
export function usePullToRefresh({
  onRefresh,
  scrollerSelector = '.app-layout__main',
  threshold = 80,
  dampening = 0.5,
  maxPull = 120,
  enabled = true,
}: PullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const indicatorRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const spinnerRef = useRef<HTMLSpanElement | null>(null)

  // Refs so the touch listeners always see the latest callback /
  // disabled state without re-attaching.
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled
  const refreshingRef = useRef(false)

  useEffect(() => {
    if (!enabled) return
    const scroller = document.querySelector(scrollerSelector) as HTMLElement | null
    if (!scroller) return

    // Write the current pull distance straight to the DOM. `animate`
    // controls whether the snap-back / park transition runs (off while the
    // finger tracks 1:1, on for release and settle).
    const apply = (dist: number, animate: boolean) => {
      const progress = Math.min(dist / threshold, 1)
      if (indicatorRef.current) {
        indicatorRef.current.style.height = `${dist}px`
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${dist}px)`
        contentRef.current.style.transition = animate ? 'transform 0.25s ease' : 'none'
      }
      if (spinnerRef.current) {
        spinnerRef.current.style.opacity = String(progress)
        // While refreshing, the CSS spin animation owns the transform.
        spinnerRef.current.style.transform = refreshingRef.current
          ? ''
          : `rotate(${progress * 180}deg)`
      }
    }

    let startY = 0
    let tracking = false
    let pulled = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current || !enabledRef.current) return
      if (scroller.scrollTop > 0) return
      const touch = e.touches[0]
      if (!touch) return
      startY = touch.clientY
      tracking = true
      pulled = 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!tracking) return
      if (scroller.scrollTop > 0) {
        tracking = false
        pulled = 0
        apply(0, true)
        return
      }
      const touch = e.touches[0]
      if (!touch) return
      const delta = touch.clientY - startY
      if (delta <= 0) {
        pulled = 0
        apply(0, false)
        return
      }
      pulled = delta * dampening
      const visual = Math.min(pulled, maxPull)
      if (e.cancelable) e.preventDefault()
      apply(visual, false)
    }

    const handleTouchEnd = () => {
      if (!tracking) return
      tracking = false
      const passed = pulled >= threshold
      if (passed) {
        refreshingRef.current = true
        setIsRefreshing(true)
        // Park at threshold height while the refetch is in flight.
        apply(threshold, true)
        Promise.resolve()
          .then(() => onRefreshRef.current())
          .finally(() => {
            refreshingRef.current = false
            setIsRefreshing(false)
            apply(0, true)
            pulled = 0
          })
      } else {
        apply(0, true)
        pulled = 0
      }
    }

    scroller.addEventListener('touchstart', handleTouchStart, { passive: true })
    scroller.addEventListener('touchmove', handleTouchMove, { passive: false })
    scroller.addEventListener('touchend', handleTouchEnd, { passive: true })
    scroller.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return () => {
      scroller.removeEventListener('touchstart', handleTouchStart)
      scroller.removeEventListener('touchmove', handleTouchMove)
      scroller.removeEventListener('touchend', handleTouchEnd)
      scroller.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [enabled, scrollerSelector, threshold, dampening, maxPull])

  return { indicatorRef, contentRef, spinnerRef, isRefreshing }
}
