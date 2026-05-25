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
 * Why a custom hook (rather than a library): we have a single nested
 * scroll container (`.app-layout__main`), need a substantial dampening
 * to avoid accidental triggers during normal vertical scrolling, and
 * want to control the indicator's transform from React state instead
 * of mutating a portal element.
 *
 * Anti-accidental-trigger design:
 * 1. Tracking only starts when scrollTop === 0 at touchstart.
 * 2. Dampening 0.5: 160px finger drag → 80px visual (= threshold). On a
 *    typical phone (~7cm tall content area) that's roughly half-screen
 *    of swipe — a deliberate gesture, not a quick scroll past the top.
 * 3. If the user starts scrolling away during the gesture
 *    (scrollTop > 0), tracking aborts and the indicator snaps back.
 * 4. While tracking, touchmove is preventDefault'd so the browser
 *    doesn't rubber-band on top of our visual.
 */
export function usePullToRefresh({
  onRefresh,
  scrollerSelector = '.app-layout__main',
  threshold = 80,
  dampening = 0.5,
  maxPull = 120,
  enabled = true,
}: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

    let startY = 0
    let tracking = false
    // The dampened pull amount we'd display *if* maxPull weren't capping it.
    // Used to compare against threshold (we trigger on the un-clamped value
    // to keep the trigger threshold consistent with the visual feedback).
    let pulled = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current || !enabledRef.current) return
      // Only engage when the user is at the very top — otherwise this is
      // a normal scroll gesture, not a pull-to-refresh.
      if (scroller.scrollTop > 0) return
      const touch = e.touches[0]
      if (!touch) return
      startY = touch.clientY
      tracking = true
      pulled = 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!tracking) return
      // If the user managed to scroll away during the gesture (e.g. the
      // OS un-clamped overscroll fires), abort.
      if (scroller.scrollTop > 0) {
        tracking = false
        pulled = 0
        setPullDistance(0)
        return
      }
      const touch = e.touches[0]
      if (!touch) return
      const delta = touch.clientY - startY
      if (delta <= 0) {
        // Moved up or no movement → reset visuals but keep tracking in
        // case the finger comes back down.
        pulled = 0
        setPullDistance(0)
        return
      }
      pulled = delta * dampening
      const visual = Math.min(pulled, maxPull)
      // Suppress browser rubber-band so our overlay reads cleanly. We
      // only call this when we are actually pulling (delta > 0) — vertical
      // swipes that didn't engage tracking still scroll normally.
      if (e.cancelable) e.preventDefault()
      setPullDistance(visual)
    }

    const handleTouchEnd = () => {
      if (!tracking) return
      tracking = false
      const passed = pulled >= threshold
      if (passed) {
        refreshingRef.current = true
        setIsRefreshing(true)
        // Park at threshold height while the refetch is in flight.
        setPullDistance(threshold)
        Promise.resolve()
          .then(() => onRefreshRef.current())
          .finally(() => {
            refreshingRef.current = false
            setIsRefreshing(false)
            setPullDistance(0)
            pulled = 0
          })
      } else {
        setPullDistance(0)
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

  return {
    pullDistance,
    isRefreshing,
    /** 0 → 1 progress towards the trigger threshold. */
    progress: Math.min(pullDistance / threshold, 1),
    threshold,
  }
}
