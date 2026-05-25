import { useQuery } from '@tanstack/react-query'
import { modulesApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type { BackendCourseLesson, BackendModule } from '@/api/types'

/** Lessons inside a given module. */
export function useModuleLessons(moduleId: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['modules', 'lessons', moduleId, lang],
    queryFn: () =>
      modulesApi.getLessons(moduleId as number, { lang }).then((res) => res.data),
    select: (r): BackendCourseLesson[] => r.data,
    enabled: moduleId != null,
    staleTime: 5 * 60 * 1000,
    throwOnError: false,
    retry: false,
  })
}

export function useModuleDetail(moduleId: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['modules', 'detail', moduleId, lang],
    queryFn: () =>
      modulesApi.getById(moduleId as number, { lang }).then((res) => res.data),
    select: (r): BackendModule => r.data,
    enabled: moduleId != null,
    staleTime: 5 * 60 * 1000,
    throwOnError: false,
    retry: false,
  })
}
