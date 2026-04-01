import { useQuery } from '@tanstack/react-query'
import { wholesaleApi } from '@/api/endpoints'

export function useWholesale() {
  return useQuery({
    queryKey: ['wholesale'],
    queryFn: async () => {
      const response = await wholesaleApi.getList()
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
