import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'

const STALE = 5 * 60 * 1000

export function useEvents() {
  const lang = useLang()
  return useQuery({
    queryKey: ['events', 'list', lang],
    queryFn: () => eventsApi.getList({ lang }).then((r) => r.data),
    select: (r) => r.data,
    staleTime: STALE,
  })
}

export function useEvent(id: number | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['events', 'detail', id, lang],
    queryFn: () => eventsApi.getById(id as number, { lang }).then((r) => r.data),
    select: (r) => r.data,
    enabled: id != null,
    staleTime: STALE,
  })
}
