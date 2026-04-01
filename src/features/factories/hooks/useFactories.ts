import { useQuery } from '@tanstack/react-query'
import { factoriesApi } from '@/api/endpoints'

export function useFactories() {
  return useQuery({
    queryKey: ['factories'],
    queryFn: async () => {
      const response = await factoriesApi.getList()
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
