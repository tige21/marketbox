import { useQuery } from '@tanstack/react-query'
import { sellersApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type { BackendSeller } from '@/api/types'

const STALE = 10 * 60 * 1000

export function useSellers() {
  const lang = useLang()
  return useQuery({
    queryKey: ['sellers', 'list', lang],
    queryFn: () => sellersApi.getList({ lang }).then((r) => r.data),
    select: (r): BackendSeller[] => r.data,
    staleTime: STALE,
  })
}

export function useSeller(id: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['sellers', 'detail', id, lang],
    queryFn: () =>
      sellersApi.getById(id as number, { lang }).then((r) => r.data),
    select: (r): BackendSeller => r.data,
    enabled: id != null,
    staleTime: STALE,
  })
}

// Back-compat: legacy name used by existing imports.
export const useWholesale = useSellers
