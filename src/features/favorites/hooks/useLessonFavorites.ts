import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonsApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type { BackendLesson } from '@/api/types'

const KEY = ['lessons', 'favorites'] as const

// Dev mode (`VITE_MOCK_TG=true`) uses a fake auth token the backend would
// reject with 401, which would cascade into a global auth clear. Bypass
// the network entirely in dev — the page just shows the empty state.
const USE_MOCK_TG = import.meta.env['VITE_MOCK_TG'] === 'true'

// Minimum shape required to favorite a lesson — just an `id`. The hook
// also accepts richer shapes (BackendLesson, BackendCourseLesson) and
// stores them in the optimistic cache so they render immediately without
// waiting for the next /favorites refetch. No index signature here so
// concrete types like `BackendLesson` remain assignable.
export interface FavoritableLesson {
  id: number | string
}

export function useLessonFavorites() {
  const lang = useLang()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: [...KEY, lang],
    queryFn: () =>
      USE_MOCK_TG
        ? Promise.resolve([] as BackendLesson[])
        : lessonsApi.getFavorites({ lang }).then((r) => r.data.data),
  })

  const favoritesSet = new Set((query.data ?? []).map((l) => l.id))

  const toggle = useMutation({
    mutationFn: async (lesson: FavoritableLesson) => {
      if (USE_MOCK_TG) return lesson
      if (favoritesSet.has(lesson.id as number)) {
        await lessonsApi.removeFavorite(lesson.id)
      } else {
        await lessonsApi.addFavorite(lesson.id)
      }
      return lesson
    },
    onMutate: async (lesson: FavoritableLesson) => {
      await qc.cancelQueries({ queryKey: KEY })
      const prev = qc.getQueryData<BackendLesson[]>([...KEY, lang]) ?? []
      const isFav = favoritesSet.has(lesson.id as number)
      const next = isFav
        ? prev.filter((l) => l.id !== lesson.id)
        // Cast: the optimistic cache row may not be a full BackendLesson,
        // but it has the fields LessonCard reads (id/title/image), and
        // the next /favorites refetch overwrites it with the canonical
        // server shape.
        : [lesson as unknown as BackendLesson, ...prev]
      qc.setQueryData([...KEY, lang], next)
      return { prev }
    },
    onError: (_err, _lesson, ctx) => {
      if (ctx?.prev) qc.setQueryData([...KEY, lang], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })

  return {
    lessons: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    /** Re-fetch favorites from the server. Used by pull-to-refresh. */
    refetch: query.refetch,
    isFavorite: (id: number | string) => favoritesSet.has(id as number),
    toggle: (lesson: FavoritableLesson) => toggle.mutate(lesson),
    isPending: toggle.isPending,
    // React Query v5 keeps `mutation.variables` populated AFTER the
    // mutation settles, so reading `variables.id` directly would mark
    // the last-clicked lesson as permanently pending — disabling its
    // heart button forever (=> can never unfavorite). Gate on
    // `isPending` so the id resets to `undefined` on settle.
    pendingId: toggle.isPending ? toggle.variables?.id : undefined,
  }
}
