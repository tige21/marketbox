import { useQuery } from '@tanstack/react-query'
import { cargoApi } from '@/api/endpoints'
import type { CargoType } from '@/api/types'

export function useCargo(type?: CargoType) {
  return useQuery({
    queryKey: ['cargo', type ?? 'all'],
    queryFn: async () => {
      const response = await cargoApi.getList(type ? { type } : undefined)
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCargoDetail(id: string) {
  return useQuery({
    queryKey: ['cargo', id],
    queryFn: async () => {
      const response = await cargoApi.getById(id)
      return response.data.data
    },
    enabled: !!id,
  })
}
