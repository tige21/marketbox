import { useQuery } from '@tanstack/react-query'
import { cargoLogisticsApi } from '@/api/endpoints'
import type { BackendCargoLogistic, CargoLogisticKind } from '@/api/types'
import { useLang } from '@/api/locale'

/**
 * Flat list of cargo logistics records. Backend uses `type` to distinguish:
 *   1 = logistics
 *   2 = fulfillment
 * Filter is applied via `select` so the same query cache backs both views.
 */
export function useCargoLogistics(kind?: CargoLogisticKind) {
  const lang = useLang()
  return useQuery({
    queryKey: ['cargo-logistics', 'list', lang],
    queryFn: () => cargoLogisticsApi.getAll({ lang }).then((res) => res.data),
    select: (r): BackendCargoLogistic[] => {
      const all = r.data
      return kind == null ? all : all.filter((item) => item.type === kind)
    },
    staleTime: 5 * 60 * 1000,
  })
}
