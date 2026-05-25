import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type { BackendModule } from '@/api/types'

/** Modules for a given course (Course → Module → Lesson hierarchy). */
export function useCourseModules(courseId: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['courses', 'modules', courseId, lang],
    queryFn: () =>
      coursesApi.getModules(courseId as number, { lang }).then((res) => res.data),
    select: (r): BackendModule[] => r.data,
    enabled: courseId != null,
    staleTime: 5 * 60 * 1000,
    // Render the empty state on 404 instead of triggering ErrorBoundary.
    throwOnError: false,
    retry: false,
  })
}
