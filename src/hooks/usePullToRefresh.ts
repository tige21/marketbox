import { useState, useRef, useCallback } from 'react'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: PullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0]?.clientY ?? 0
      pulling.current = true
    }
  }, [])

  const onTouchEnd = useCallback(async (e: React.TouchEvent) => {
    if (!pulling.current) return
    const endY = e.changedTouches[0]?.clientY ?? 0
    const delta = endY - startY.current

    if (delta > threshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    pulling.current = false
  }, [onRefresh, threshold])

  return { isRefreshing, onTouchStart, onTouchEnd }
}
