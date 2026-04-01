import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import './ChinaGuidePage.scss'

const b = 'china-guide-page'

interface GuideCategory {
  id: string
  route: string
  titleKey: string
  descKey: string
  imageUrl: string
}

const CATEGORIES: GuideCategory[] = [
  {
    id: 'tours',
    route: '/china-guide/tours',
    titleKey: 'chinaGuide:categories.tours',
    descKey: 'chinaGuide:categories.tours_desc',
    imageUrl: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&h=300&fit=crop',
  },
  {
    id: 'markets',
    route: '/china-guide/markets',
    titleKey: 'chinaGuide:categories.markets',
    descKey: 'chinaGuide:categories.markets_desc',
    imageUrl: 'https://images.unsplash.com/photo-1513623935135-c896b59073c1?w=600&h=300&fit=crop',
  },
  {
    id: 'restaurants',
    route: '/china-guide/restaurants',
    titleKey: 'chinaGuide:categories.restaurants',
    descKey: 'chinaGuide:categories.restaurants_desc',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop',
  },
  {
    id: 'hotels',
    route: '/china-guide/hotels',
    titleKey: 'chinaGuide:categories.hotels',
    descKey: 'chinaGuide:categories.hotels_desc',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=300&fit=crop',
  },
  {
    id: 'translators',
    route: '/china-guide/translators',
    titleKey: 'chinaGuide:categories.translators',
    descKey: 'chinaGuide:categories.translators_desc',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=300&fit=crop',
  },
]

function ChevronRightIcon() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
      <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChinaGuidePage() {
  const { t } = useTranslation(['chinaGuide', 'common'])
  const navigate = useNavigate()

  function handleCardClick(route: string) {
    triggerHaptic('tap')
    navigate(route)
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={t('chinaGuide:title')} />

      <div className={bem(b, 'content')}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={bem(b, 'card')}
            onClick={() => handleCardClick(cat.route)}
            aria-label={t(cat.titleKey)}
          >
            <img
              className={bem(b, 'card-image')}
              src={cat.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div className={bem(b, 'card-bar')}>
              <div className={bem(b, 'card-bar-left')}>
                <span className={bem(b, 'card-name')}>{t(cat.titleKey)}</span>
              </div>
              <div className={bem(b, 'card-bar-right')}>
                <p className={bem(b, 'card-desc')}>{t(cat.descKey)}</p>
                <span className={bem(b, 'card-chevron')}>
                  <ChevronRightIcon />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
