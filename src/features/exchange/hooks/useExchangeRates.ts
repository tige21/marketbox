import { useQuery } from '@tanstack/react-query'
import { getExchangeRates } from '@/api/externalExchange'
import type { ExchangeRatesResponse } from '@/api/types'

export function useExchangeRates() {
  return useQuery<ExchangeRatesResponse>({
    // 'multi' key (was 'fawaz') also busts the persisted cache from the
    // single-source era.
    queryKey: ['exchange', 'rates', 'multi'],
    queryFn: getExchangeRates,
    // Fawaz updates once a day. 30-min fresh window is plenty.
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    // If the API ever goes down, keep the stale data on screen.
    refetchOnWindowFocus: false,
    // Rates come from an external CDN (jsdelivr / currency-api). On networks
    // where that CDN is blocked (some TG WebViews in UZ/RU), the request
    // fails. Override the global `throwOnError: true` so the failure surfaces
    // as ExchangePage's own graceful EmptyState instead of crashing the whole
    // screen into the ErrorBoundary. Retry a couple of times first.
    throwOnError: false,
    retry: 2,
  })
}
