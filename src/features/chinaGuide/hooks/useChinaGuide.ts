import { useQuery } from '@tanstack/react-query'
import { chinaGuideApi } from '@/api/endpoints'
import type { ChinaGuideType } from '@/api/types'

export function useChinaGuideList(type: ChinaGuideType) {
  return useQuery({
    queryKey: ['china-guide', type],
    queryFn: async () => {
      const response = await chinaGuideApi.getByType(type)
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useChinaGuideDetail(type: ChinaGuideType, id: string) {
  return useQuery({
    queryKey: ['china-guide', type, id],
    queryFn: async () => {
      const response = await chinaGuideApi.getById(type, id)
      return response.data.data
    },
    enabled: !!id,
  })
}
