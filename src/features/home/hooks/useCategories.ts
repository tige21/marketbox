import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/api/endpoints'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
    staleTime: 30 * 60 * 1000, // 30 min — static data
    gcTime: 60 * 60 * 1000,    // 60 min
  })
}
