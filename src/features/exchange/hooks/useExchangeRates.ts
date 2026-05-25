import { useQuery } from '@tanstack/react-query'
import { getRatesFromFawaz } from '@/api/externalExchange'
import type { ExchangeRatesResponse } from '@/api/types'

export function useExchangeRates() {
  return useQuery<ExchangeRatesResponse>({
    queryKey: ['exchange', 'rates', 'fawaz'],
    queryFn: getRatesFromFawaz,
    // Fawaz updates once a day. 30-min fresh window is plenty.
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    // If the API ever goes down, keep the stale data on screen.
    refetchOnWindowFocus: false,
  })
}
