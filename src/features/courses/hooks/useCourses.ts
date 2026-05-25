import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type { BackendCourse } from '@/api/types'

const STALE = 5 * 60 * 1000

export function useCourses() {
  const lang = useLang()
  return useQuery({
    queryKey: ['courses', 'list', lang],
    queryFn: () => coursesApi.getList({ lang }).then((r) => r.data),
    select: (r): BackendCourse[] => r.data,
    staleTime: STALE,
  })
}

export function useCourseDetail(id: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['courses', 'detail', id, lang],
    queryFn: () =>
      coursesApi.getById(id as number, { lang }).then((r) => r.data),
    select: (r): BackendCourse => r.data,
    enabled: id != null,
    staleTime: STALE,
    // The page-header title is the only consumer; if the route was
    // reached with a stale or non-existent course id (e.g. coming back
    // from a cargo→courses redirect), we'd rather render an empty
    // header than crash to ErrorBoundary.
    throwOnError: false,
    retry: false,
  })
}
