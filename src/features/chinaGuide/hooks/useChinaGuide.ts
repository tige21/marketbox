import { useQuery } from '@tanstack/react-query'
import { chinaGuideApi } from '@/api/endpoints'
import { useLang, type Localized } from '@/api/locale'
import type {
  ChinaGuideItem,
  ChinaGuideType,
  BackendGuid,
  BackendMarket,
  BackendHotel,
  BackendRestaurant,
  BackendTour,
  BackendTranslator,
} from '@/api/types'

const STALE = 5 * 60 * 1000

function pickRu<T = string>(v: Localized<T>): T | null {
  if (v == null) return null
  if (typeof v === 'object' && !Array.isArray(v)) {
    const obj = v as { ru?: T | null; uz?: T | null }
    return obj.ru ?? obj.uz ?? null
  }
  return v as T
}

function pickUz<T = string>(v: Localized<T>): T | null {
  if (v == null) return null
  if (typeof v === 'object' && !Array.isArray(v)) {
    const obj = v as { ru?: T | null; uz?: T | null }
    return obj.uz ?? obj.ru ?? null
  }
  return v as T
}

/** Choose display image URL based on current lang with fallback. */
function pickImg(v: Localized | null | undefined): string {
  if (!v) return ''
  if (typeof v === 'object') {
    const obj = v as { ru?: string | null; uz?: string | null }
    return obj.ru ?? obj.uz ?? ''
  }
  return v
}

// ─── Adapters: backend entity → fronted ChinaGuideItem ──────

function adaptBase(
  e: BackendMarket | BackendHotel | BackendRestaurant,
  type: 'markets' | 'hotels' | 'restaurants',
): ChinaGuideItem {
  return {
    id: String(e.id),
    type,
    name: pickRu(e.title) ?? '',
    nameUz: pickUz(e.title) ?? '',
    description: pickRu(e.description) ?? '',
    descriptionUz: pickUz(e.description) ?? '',
    city: '',
    address: pickRu(e.address) ?? '',
    imageUrl: pickImg(e.image),
    rating: 0,
    reviewsCount: 0,
    priceRange: '',
    isPremium: false,
    shortDesc: pickRu(e.title_short) ?? '',
    baiduUrl: e.baidu_url ?? undefined,
    appleUrl: e.apple_map_url ?? undefined,
    tourDate: e.date ?? undefined,
    externalUrl: e.url || e.baidu_url || e.apple_map_url || undefined,
  }
}

function adaptTour(e: BackendTour): ChinaGuideItem {
  // `title_url` is the BUTTON LABEL ("Участвовать"), not a URL — only `url`
  // is the real link.
  const externalUrl = e.url || undefined
  // Prefer the new full `description` field (May 2026) for the detail page;
  // fall back to short `preview_text` while backend backfills.
  const fullRu = pickRu(e.description) ?? pickRu(e.preview_text) ?? ''
  const fullUz = pickUz(e.description) ?? pickUz(e.preview_text) ?? ''
  return {
    id: String(e.id),
    type: 'tours',
    name: pickRu(e.title) ?? '',
    nameUz: pickUz(e.title) ?? '',
    description: fullRu,
    descriptionUz: fullUz,
    city: '',
    address: pickRu(e.address) ?? '',
    imageUrl: pickImg(e.image),
    rating: 0,
    reviewsCount: 0,
    priceRange: '',
    isPremium: false,
    tourDate: e.date,
    externalUrl,
  }
}

function adaptTranslator(e: BackendTranslator): ChinaGuideItem {
  const fullRu = `${pickRu(e.name) ?? ''} ${pickRu(e.surname) ?? ''}`.trim()
  const fullUz = `${pickUz(e.name) ?? ''} ${pickUz(e.surname) ?? ''}`.trim()

  const languages = Array.isArray(e.languages)
    ? e.languages.map((x) => pickRu(x.title) ?? '').filter(Boolean)
    : []
  const canHelp = Array.isArray(e.can_help)
    ? e.can_help.map((x) => pickRu(x.title) ?? '').filter(Boolean)
    : []
  const externalUrl = pickRu(e.title_url) ?? e.url ?? undefined

  return {
    id: String(e.id),
    type: 'translators',
    name: fullRu,
    nameUz: fullUz,
    description: pickRu(e.preview_text) ?? '',
    descriptionUz: pickUz(e.preview_text) ?? '',
    city: '',
    address: pickRu(e.address) ?? '',
    imageUrl: pickImg(e.photo),
    rating: 0,
    reviewsCount: 0,
    priceRange: '',
    isPremium: false,
    age: e.age,
    languages,
    origin: pickRu(e.hometown) ?? '',
    aboutMe: pickRu(e.about_me) ?? '',
    canHelp,
    isVerified: !!e.is_verify,
    externalUrl,
  }
}

// ─── Hook ───────────────────────────────────────────────────

export function useChinaGuideList(type: ChinaGuideType) {
  const lang = useLang()
  return useQuery({
    queryKey: ['china-guide', type, lang],
    queryFn: async (): Promise<ChinaGuideItem[]> => {
      switch (type) {
        case 'markets': {
          const r = await chinaGuideApi.getMarkets({ lang })
          return r.data.data.map((e) => adaptBase(e, 'markets'))
        }
        case 'hotels': {
          const r = await chinaGuideApi.getHotels({ lang })
          return r.data.data.map((e) => adaptBase(e, 'hotels'))
        }
        case 'restaurants': {
          const r = await chinaGuideApi.getRestaurants({ lang })
          return r.data.data.map((e) => adaptBase(e, 'restaurants'))
        }
        case 'tours': {
          const r = await chinaGuideApi.getTours({ lang })
          return r.data.data.map(adaptTour)
        }
        case 'translators': {
          const r = await chinaGuideApi.getTranslators({ lang })
          return r.data.data.map(adaptTranslator)
        }
      }
    },
    staleTime: STALE,
  })
}

export function useChinaGuideDetail(type: ChinaGuideType, id: string) {
  const lang = useLang()
  return useQuery({
    queryKey: ['china-guide', type, id, lang],
    queryFn: async (): Promise<ChinaGuideItem> => {
      switch (type) {
        case 'markets': {
          const r = await chinaGuideApi.getMarket(id, { lang })
          return adaptBase(r.data.data, 'markets')
        }
        case 'hotels': {
          const r = await chinaGuideApi.getHotel(id, { lang })
          return adaptBase(r.data.data, 'hotels')
        }
        case 'restaurants': {
          const r = await chinaGuideApi.getRestaurant(id, { lang })
          return adaptBase(r.data.data, 'restaurants')
        }
        case 'tours': {
          const r = await chinaGuideApi.getTour(id, { lang })
          return adaptTour(r.data.data)
        }
        case 'translators': {
          const r = await chinaGuideApi.getTranslator(id, { lang })
          return adaptTranslator(r.data.data)
        }
      }
    },
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useGuids() {
  const lang = useLang()
  return useQuery({
    queryKey: ['guids', 'list', lang],
    queryFn: () => chinaGuideApi.getGuids({ lang }).then((r) => r.data),
    select: (r): BackendGuid[] => r.data,
    staleTime: STALE,
  })
}
