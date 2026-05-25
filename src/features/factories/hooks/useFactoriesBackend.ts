import { useQuery } from '@tanstack/react-query'
import { factoriesApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type {
  BackendFabric,
  BackendFabricSection,
  BackendCompany,
} from '@/api/types'

const STALE = 10 * 60 * 1000

export function useFabrics() {
  const lang = useLang()
  return useQuery({
    queryKey: ['fabrics', 'list', lang],
    queryFn: () => factoriesApi.getFabrics({ lang }).then((r) => r.data),
    select: (r): BackendFabric[] => r.data,
    staleTime: STALE,
  })
}

export function useFabric(id: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['fabrics', 'detail', id, lang],
    queryFn: () =>
      factoriesApi.getFabric(id as number, { lang }).then((r) => r.data),
    select: (r): BackendFabric => r.data,
    enabled: id != null,
    staleTime: STALE,
  })
}

export function useFabricSections(fabricId: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['fabrics', fabricId, 'sections', lang],
    queryFn: () =>
      factoriesApi
        .getSections(fabricId as number, { lang })
        .then((r) => r.data),
    select: (r): BackendFabricSection[] => r.data,
    enabled: fabricId != null,
    staleTime: STALE,
  })
}

export function useFabricSectionCompanies(
  fabricId: number | string | undefined,
  sectionId: number | string | undefined,
) {
  const lang = useLang()
  return useQuery({
    queryKey: ['fabrics', fabricId, 'sections', sectionId, 'companies', lang],
    queryFn: () =>
      factoriesApi
        .getCompaniesInSection(fabricId as number, sectionId as number, { lang })
        .then((r) => r.data),
    select: (r): BackendCompany[] => r.data,
    enabled: fabricId != null && sectionId != null,
    staleTime: STALE,
  })
}

export function useCompany(companyId: number | string | undefined) {
  const lang = useLang()
  return useQuery({
    queryKey: ['companies', 'detail', companyId, lang],
    queryFn: () =>
      factoriesApi
        .getCompanyById(companyId as number, { lang })
        .then((r) => r.data),
    select: (r): BackendCompany => r.data,
    enabled: companyId != null,
    staleTime: STALE,
  })
}
