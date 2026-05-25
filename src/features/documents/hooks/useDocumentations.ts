import { useQuery } from '@tanstack/react-query'
import { documentationsApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type { BackendDocumentation, BackendDocumentationCandidate } from '@/api/types'

const STALE = 10 * 60 * 1000

export function useDocumentations() {
  const lang = useLang()
  return useQuery({
    queryKey: ['documentations', 'list', lang],
    queryFn: () => documentationsApi.getAll({ lang }).then((res) => res.data),
    select: (r): BackendDocumentation[] => r.data,
    staleTime: STALE,
  })
}

export function useDocumentation(id: number | string | undefined) {
  const lang = useLang()
  const numericId = id != null ? Number(id) : undefined

  return useQuery({
    queryKey: ['documentations', 'detail', numericId, lang],
    queryFn: () =>
      documentationsApi
        .getById(numericId as number, { lang })
        .then((res) => res.data),
    select: (r): BackendDocumentation => r.data,
    enabled: numericId != null,
    staleTime: STALE,
  })
}

export function useDocumentationCandidates(id: number | string | undefined) {
  const lang = useLang()
  const numericId = id != null ? Number(id) : undefined

  return useQuery({
    queryKey: ['documentations', 'candidates', numericId, lang],
    queryFn: () =>
      documentationsApi
        .getCandidates(numericId as number, { lang })
        .then((res) => res.data),
    select: (r): BackendDocumentationCandidate[] => r.data,
    enabled: numericId != null,
    staleTime: STALE,
  })
}
