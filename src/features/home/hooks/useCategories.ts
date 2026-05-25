import { useQuery } from '@tanstack/react-query'
import { menuApi } from '@/api/endpoints'
import { useLang, pickLocaleStr, type Lang } from '@/api/locale'
import type { BackendMenuInfo, Category, MenuType } from '@/api/types'

// Backend `/api/menu` returns a `type` discriminator per item. We map it
// to the client route + visual size of the card. If backend adds new
// types later, add an entry here.
const TYPE_CONFIG: Record<MenuType, { route: string; titleSize: 'lg' | 'md' | 'sm' }> = {
  course:        { route: '/courses',         titleSize: 'lg' },
  fabric:        { route: '/factories',       titleSize: 'lg' },
  cargo:         { route: '/cargo',           titleSize: 'lg' },
  seller:        { route: '/wholesale',       titleSize: 'md' },
  guid:          { route: '/china-guide',     titleSize: 'md' },
  work:          { route: '/jobs',            titleSize: 'md' },
  design:        { route: '/design-services', titleSize: 'md' },
  documentation: { route: '/documents',       titleSize: 'md' },
  exchange:      { route: '/exchange',        titleSize: 'md' },
  event:         { route: '/events',          titleSize: 'md' },
  article:       { route: '/news',            titleSize: 'md' },
}

function adapt(item: BackendMenuInfo, lang: Lang): Category {
  const title = pickLocaleStr(item.title, lang)
  const config = TYPE_CONFIG[item.type as MenuType]
  return {
    id: String(item.id),
    slug: item.type || `menu-${item.id}`,
    title,
    titleUz: title,
    description: pickLocaleStr(item.preview_text, lang),
    descriptionUz: pickLocaleStr(item.preview_text, lang),
    imageUrl: pickLocaleStr(item.preview_image, lang),
    route: config?.route ?? '#',
    isPremium: false,
    isActive: true,
    order: item.id,
    titleSize: config?.titleSize ?? 'md',
  }
}

export function useCategories() {
  const lang = useLang()
  return useQuery({
    queryKey: ['categories', lang],
    queryFn: () => menuApi.getAll({ lang }).then((r) => r.data),
    select: (r): Category[] => r.data.map((item) => adapt(item, lang)),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}
