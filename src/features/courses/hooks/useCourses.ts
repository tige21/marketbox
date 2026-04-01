import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '@/api/endpoints'
import type { CourseMarketplace } from '@/api/types'

export function useCourses(marketplace?: CourseMarketplace) {
  return useQuery({
    queryKey: ['courses', marketplace ?? 'all'],
    queryFn: async () => {
      const response = await coursesApi.getList(marketplace ? { marketplace } : undefined)
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: async () => {
      const response = await coursesApi.getById(id)
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}
