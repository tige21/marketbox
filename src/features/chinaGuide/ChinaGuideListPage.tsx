import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { SkeletonCard } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import { useChinaGuideList } from './hooks'
import type { ChinaGuideType, ChinaGuideItem } from '@/api/types'
import './ChinaGuideListPage.scss'

interface ChinaGuideListPageProps {
  type: ChinaGuideType
}

const b = 'cg-list'

// ── Title map ─────────────────────────────────────────────────
const TITLE_KEYS: Record<ChinaGuideType, string> = {
  markets: 'chinaGuide:list.markets_title',
  hotels: 'chinaGuide:list.hotels_title',
  restaurants: 'chinaGuide:list.restaurants_title',
  tours: 'chinaGuide:list.tours_title',
  translators: 'chinaGuide:list.translators_title',
}

// ── Grid layout types ─────────────────────────────────────────
const GRID_TYPES: ChinaGuideType[] = ['markets', 'hotels', 'restaurants']

// ── Location pin icon ─────────────────────────────────────────
function PinIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
      <path
        d="M5 0C2.79 0 1 1.79 1 4c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4zm0 5.5A1.5 1.5 0 1 1 5 2.5a1.5 1.5 0 0 1 0 3z"
        fill="currentColor"
      />
    </svg>
  )
}

// ── Verified check icon ───────────────────────────────────────
function VerifiedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="7" fill="#ac9dff" />
      <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Grid card (markets / hotels / restaurants) ────────────────
function GridCard({ item, onPress }: { item: ChinaGuideItem; onPress: () => void }) {
  return (
    <button
      type="button"
      className={bem(b, 'grid-card')}
      onClick={onPress}
      aria-label={item.name}
    >
      <div className={bem(b, 'grid-card-img-wrap')}>
        <img
          className={bem(b, 'grid-card-img')}
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
        />
        {item.isPremium && (
          <span className={bem(b, 'premium-badge')}>PREMIUM</span>
        )}
      </div>
      <div className={bem(b, 'grid-card-body')}>
        <p className={bem(b, 'grid-card-name')}>{item.name}</p>
        <div className={bem(b, 'grid-card-location')}>
          <PinIcon />
          <span className={bem(b, 'grid-card-city')}>{item.city}</span>
        </div>
      </div>
    </button>
  )
}

// ── Tour card ─────────────────────────────────────────────────
function TourCard({ item, onPress, participateLabel }: { item: ChinaGuideItem; onPress: () => void; participateLabel: string }) {
  return (
    <article className={bem(b, 'tour-card')} onClick={onPress} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onPress()}>
      <div className={bem(b, 'tour-img-wrap')}>
        <img
          className={bem(b, 'tour-img')}
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
        />
        {item.tourDate && (
          <span className={bem(b, 'tour-date-badge')}>{item.tourDate}</span>
        )}
      </div>
      <div className={bem(b, 'tour-body')}>
        <p className={bem(b, 'tour-name')}>{item.name}</p>
        <p className={bem(b, 'tour-desc')}>{item.description}</p>
        <div className={bem(b, 'tour-footer')}>
          <div className={bem(b, 'tour-meta')}>
            <span className={bem(b, 'tour-city')}>
              <PinIcon />
              {item.city}
            </span>
            {item.maxParticipants && (
              <span className={bem(b, 'tour-seats')}>{item.maxParticipants} чел.</span>
            )}
          </div>
          <button
            type="button"
            className={bem(b, 'tour-btn')}
            onClick={e => { e.stopPropagation(); onPress() }}
          >
            {participateLabel}
          </button>
        </div>
      </div>
    </article>
  )
}

// ── Translator card ───────────────────────────────────────────
function TranslatorCard({ item, onPress }: { item: ChinaGuideItem; onPress: () => void }) {
  return (
    <button
      type="button"
      className={bem(b, 'trans-card')}
      onClick={onPress}
      aria-label={item.name}
    >
      <div className={bem(b, 'trans-avatar-wrap')}>
        <img
          className={bem(b, 'trans-avatar')}
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={bem(b, 'trans-body')}>
        <div className={bem(b, 'trans-name-row')}>
          <span className={bem(b, 'trans-name')}>{item.name}</span>
          {item.isVerified && <VerifiedIcon />}
        </div>
        {item.age !== undefined && (
          <span className={bem(b, 'trans-age')}>{item.age} лет</span>
        )}
        <div className={bem(b, 'trans-location')}>
          <PinIcon />
          <span>{item.city}</span>
        </div>
        {item.languages && item.languages.length > 0 && (
          <div className={bem(b, 'trans-langs')}>
            {item.languages.slice(0, 2).map(lang => (
              <span key={lang} className={bem(b, 'trans-lang-tag')}>{lang}</span>
            ))}
          </div>
        )}
        {item.aboutMe && (
          <p className={bem(b, 'trans-bio')}>{item.aboutMe}</p>
        )}
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────
export function ChinaGuideListPage({ type }: ChinaGuideListPageProps) {
  const { t } = useTranslation(['chinaGuide', 'common'])
  const navigate = useNavigate()
  const { data: items, isLoading, error } = useChinaGuideList(type)

  const title = t(TITLE_KEYS[type])
  const isGrid = GRID_TYPES.includes(type)
  const isTours = type === 'tours'
  const isTranslators = type === 'translators'

  function handleItemPress(item: ChinaGuideItem) {
    triggerHaptic('tap')
    navigate(`/china-guide/${type}/${item.id}`)
  }

  if (error) {
    return (
      <div className={b}>
        <GlassHeader showBack title={title} />
        <EmptyState icon="😞" title={t('common:error.generic')} />
      </div>
    )
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={title} />

      <div className={bem(b, 'body')}>
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !items?.length ? (
          <EmptyState icon="🏮" title={t('chinaGuide:empty')} />
        ) : isGrid ? (
          <div className={bem(b, 'grid')}>
            {items.map(item => (
              <GridCard key={item.id} item={item} onPress={() => handleItemPress(item)} />
            ))}
          </div>
        ) : isTours ? (
          <div className={bem(b, 'tours-list')}>
            {items.map(item => (
              <TourCard
                key={item.id}
                item={item}
                onPress={() => handleItemPress(item)}
                participateLabel={t('chinaGuide:list.participate_btn')}
              />
            ))}
          </div>
        ) : isTranslators ? (
          <div className={bem(b, 'trans-grid')}>
            {items.map(item => (
              <TranslatorCard key={item.id} item={item} onPress={() => handleItemPress(item)} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
