import { useQuery } from '@tanstack/react-query'
import { worksApi, candidatesApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type {
  BackendWork,
  BackendCandidate,
  BackendWorkCandidate,
} from '@/api/types'

const STALE = 5 * 60 * 1000

export function useWorks() {
  const lang = useLang()
  return useQuery({
    queryKey: ['works', 'list', lang],
    queryFn: () => worksApi.getList({ lang }).then((r) => r.data),
    select: (r): BackendWork[] => r.data,
    staleTime: STALE,
  })
}

export function useCandidates() {
  const lang = useLang()
  return useQuery({
    queryKey: ['candidates', 'list', lang],
    queryFn: () => candidatesApi.getList({ lang }).then((r) => r.data),
    select: (r): BackendCandidate[] => r.data,
    staleTime: STALE,
  })
}

export function useWorkCandidates(workId: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['works', 'candidates', workId, lang],
    queryFn: () =>
      worksApi
        .getCandidates(workId as number, { lang })
        .then((r) => r.data),
    select: (r): BackendWorkCandidate[] => r.data,
    enabled: workId != null,
    staleTime: STALE,
  })
}
