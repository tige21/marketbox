import { useQuery } from '@tanstack/react-query'
import { designServicesBackendApi } from '@/api/endpoints'
import { useLang } from '@/api/locale'
import type {
  BackendDesignServiceInfo,
  BackendDesignCandidate,
} from '@/api/types'

const STALE = 10 * 60 * 1000

export function useDesignServices() {
  const lang = useLang()
  return useQuery({
    queryKey: ['design-services', 'list', lang],
    queryFn: () => designServicesBackendApi.getServices({ lang }).then((r) => r.data),
    select: (r): BackendDesignServiceInfo[] => r.data,
    staleTime: STALE,
  })
}

export function useDesignCandidatesByService(
  serviceId: number | string | undefined,
) {
  const lang = useLang()
  return useQuery({
    queryKey: ['design-services', 'candidates', serviceId, lang],
    queryFn: () =>
      designServicesBackendApi
        .getCandidatesByService(serviceId as number, { lang })
        .then((r) => r.data),
    select: (r): BackendDesignCandidate[] => r.data,
    enabled: serviceId != null,
    staleTime: STALE,
  })
}

export function useDesignCandidates() {
  const lang = useLang()
  return useQuery({
    queryKey: ['design-candidates', 'list', lang],
    queryFn: () => designServicesBackendApi.getCandidates({ lang }).then((r) => r.data),
    select: (r): BackendDesignCandidate[] => r.data,
    staleTime: STALE,
  })
}
