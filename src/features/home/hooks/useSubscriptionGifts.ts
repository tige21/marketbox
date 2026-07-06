import { useQuery } from '@tanstack/react-query'
import { subscriptionGiftsApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import { useAuthStore } from '@/stores/authStore'
import type { SubscriptionGiftsResponse } from '@/api/types'

/**
 * Contest gifts for the home-header panel. Premium-only (the ladder is a
 * subscription perk), key-scoped by language since the backend localizes
 * `title`/`description`. `throwOnError: false` keeps a failure from crashing
 * the header — the panel just renders without the grid.
 */
export function useSubscriptionGifts() {
  const lang = useLang()
  const isPremium = useAuthStore((s) => s.isPremium)

  return useQuery<SubscriptionGiftsResponse>({
    queryKey: ['subscription-gifts', lang],
    queryFn: () => subscriptionGiftsApi.getList({ lang }).then((r) => r.data),
    enabled: isPremium,
    staleTime: 5 * 60 * 1000,
    // Don't let a gifts failure crash the header — the component logs the
    // error and renders the panel without the grid.
    throwOnError: false,
    retry: 1,
  })
}
