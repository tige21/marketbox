import { useQuery } from '@tanstack/react-query'
import { cargoApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type { BackendCargo, BackendCargoInfo } from '@/api/types'

const STALE = 5 * 60 * 1000

export function useCargo() {
  const lang = useLang()
  return useQuery({
    queryKey: ['cargo', 'list', lang],
    queryFn: () => cargoApi.getList({ lang }).then((r) => r.data),
    select: (r): BackendCargo[] => r.data,
    staleTime: STALE,
  })
}

export function useCargoDetail(id: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['cargo', 'detail', id, lang],
    queryFn: () =>
      cargoApi.getById(id as number, { lang }).then((r) => r.data),
    select: (r): BackendCargo => r.data,
    enabled: id != null,
    staleTime: STALE,
  })
}

export function useCargoInfo(id: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['cargo', 'info', id, lang],
    queryFn: () =>
      cargoApi.getInfo(id as number, { lang }).then((r) => r.data),
    select: (r): BackendCargoInfo => r.data,
    enabled: id != null,
    staleTime: STALE,
  })
}
