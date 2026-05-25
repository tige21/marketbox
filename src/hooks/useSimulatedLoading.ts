import { useEffect, useState } from 'react'

export function useSimulatedLoading(delay = 400, deps: unknown[] = []): boolean {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), delay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return isLoading
}
