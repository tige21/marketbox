import { useQuery } from '@tanstack/react-query'
import { newsApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type { BackendArticle, PaginationParams } from '@/api/types'

const STALE = 3 * 60 * 1000

export function useArticles(params?: PaginationParams) {
  const lang = useLang()
  return useQuery({
    queryKey: ['articles', 'list', lang, params?.page ?? 1, params?.perPage],
    queryFn: () =>
      newsApi.getList({ ...params, lang }).then((res) => res.data),
    select: (r): BackendArticle[] =>
      [...r.data].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    staleTime: STALE,
  })
}

export function useArticle(id: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['articles', 'detail', id, lang],
    queryFn: () =>
      newsApi.getById(id as number, { lang }).then((res) => res.data),
    select: (r): BackendArticle => r.data,
    enabled: id != null,
    staleTime: STALE,
  })
}
