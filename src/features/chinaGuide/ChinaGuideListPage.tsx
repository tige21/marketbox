import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SkeletonCard } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BackButton } from '@/components/BackButton'
import { BackendImage } from '@/components/BackendImage'
import { ChevronRightIcon } from '@/components/Icons'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import { useHaptic } from '@/hooks'
import { useChinaGuideList } from './hooks'
import type { ChinaGuideType, ChinaGuideItem } from '@/api/types'
import './ChinaGuideListPage.scss'
import './ChinaGuideToursPage.scss'
import './ChinaGuideMarketsPage.scss'
import './ChinaGuideTranslatorsPage.scss'
import './ChinaGuideHotelsPage.scss'

function formatTourDate(raw: string | undefined, months: string[]): string {
  if (!raw) return ''
  // Accept already-formatted label like "15 МАЯ"
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw
  try {
    const d = new Date(raw)
    const day = d.getDate()
    const month = months[d.getMonth()] ?? ''
    return `${day} ${month}`.trim()
  } catch {
    return raw
  }
}

// Format like "30 апреля" — lowercase month, no year.
function formatHotelDate(raw: string | undefined, monthsLong: string[]): string {
  if (!raw) return ''
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw
  try {
    const d = new Date(raw)
    const day = d.getDate()
    const month = monthsLong[d.getMonth()] ?? ''
    return `${day} ${month}`.trim()
  } catch {
    return raw
  }
}

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

function ListCard({
  item,
  onPress,
}: {
  item: ChinaGuideItem
  onPress: () => void
}) {
  const { t } = useTranslation('common')
  const title = (item.name || '').replace(/\n/g, ' ')
  const secondary = item.shortDesc || item.city
  return (
    <article
      className={bem(b, 'card')}
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPress()}
      aria-label={title}
    >
      <BackendImage
        className={bem(b, 'card-image')}
        src={item.imageUrl}
        alt=""
      />
      <div className={bem(b, 'card-bar')}>
        <span className={bem(b, 'card-name')}>{title}</span>
        {secondary && <span className={bem(b, 'card-desc')}>{secondary}</span>}
        <button
          type="button"
          className={bem(b, 'card-details-btn')}
          onClick={(e) => { e.stopPropagation(); onPress() }}
        >
          {t('actions.details', { defaultValue: 'Подробнее' })}
          <ChevronRightIcon />
        </button>
      </div>
    </article>
  )
}

// Pull "Country, City" from a full backend address like
//   "Китай, г. Гуанчжоу, р-н Юэсю, ул. Хэнфулу, 155"
// or "Китай, провинция Гуандун, город Гуанчжоу, ...".
// Returns the original string if it can't find a city marker.
function shortAddress(full: string | undefined, fallback: string): string {
  if (!full) return fallback
  const parts = full.split(',').map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return fallback
  const country = parts[0] ?? fallback
  const cityPart = parts.slice(1).find((p) => /^(г\.|город|шаҳар|sh\.)/i.test(p))
  if (cityPart) {
    const cityName = cityPart.replace(/^(г\.\s*|город\s+|шаҳар\s+|sh\.\s*)/i, '')
    return `${country}, ${cityName}`
  }
  return parts.length > 1 ? `${country}, ${parts[1]}` : country
}

// ── Market grid card (Figma 1048:12030) ──────────────────────
function MarketCard({
  item,
  onPress,
}: {
  item: ChinaGuideItem
  onPress: () => void
}) {
  const { t } = useTranslation(['chinaGuide', 'common'])
  const title = (item.name || '').replace(/\n/g, ' ')
  const location = shortAddress(item.address, item.city || t('country_fallback'))
  return (
    <article
      className={bem('cg-markets', 'tile')}
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPress()}
      aria-label={title}
    >
      <BackendImage
        className={bem('cg-markets', 'tile-image')}
        src={item.imageUrl}
        alt=""
      />
      <h3 className={bem('cg-markets', 'tile-name')}>{title}</h3>
      <div className={bem('cg-markets', 'tile-location')}>
        <img
          src="/app/images/china-guide/location.svg"
          alt=""
          aria-hidden="true"
          className={bem('cg-markets', 'tile-location-icon')}
        />
        <span>{location}</span>
      </div>
      <button
        type="button"
        className={bem('cg-markets', 'details-btn')}
        onClick={(e) => { e.stopPropagation(); onPress() }}
      >
        {t('common:actions.details', { defaultValue: 'Подробнее' })}
      </button>
    </article>
  )
}

// ── Tour card (News-style) ────────────────────────────────────
function TourCard({
  item,
  onOpen,
}: {
  item: ChinaGuideItem
  onOpen: () => void
}) {
  const { i18n, t } = useTranslation(['chinaGuide', 'common'])
  const isUz = i18n.language === 'uz'
  const title = (isUz && item.nameUz ? item.nameUz : item.name).replace(/\n/g, ' ')
  const months = t('months_short', { returnObjects: true }) as string[]
  const badge = formatTourDate(item.tourDate, months)

  const handleCardClick = () => {
    triggerHaptic('tap')
    onOpen()
  }

  return (
    <article className={bem('cg-tours', 'item')}>
      <div
        className={bem('cg-tours', 'card')}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        aria-label={title}
      >
        <BackendImage
          src={item.imageUrl}
          alt=""
          className={bem('cg-tours', 'card-image')}
        />
        <div className={bem('cg-tours', 'glass-bar')}>
          {badge && (
            <div className={bem('cg-tours', 'date-badge')}>
              <img src="/app/images/news/calendar.svg" alt="" aria-hidden="true" />
              <span>{badge}</span>
            </div>
          )}
          <p className={bem('cg-tours', 'glass-text')}>{title}</p>
        </div>
      </div>

      <button
        type="button"
        className={bem('cg-tours', 'details-btn')}
        onClick={(e) => { e.stopPropagation(); onOpen() }}
      >
        {t('common:actions.details', { defaultValue: 'Подробнее' })}
      </button>
    </article>
  )
}

// ── Hotel card ────────────────────────────────────────────────
function HotelCard({
  item,
  onPress,
}: {
  item: ChinaGuideItem
  onPress: () => void
}) {
  const { i18n, t } = useTranslation(['chinaGuide', 'common'])
  const isUz = i18n.language === 'uz'
  const title = (isUz && item.nameUz ? item.nameUz : item.name).replace(/\n/g, ' ')
  const description = isUz && item.descriptionUz ? item.descriptionUz : item.description
  const monthsLong = t('months_long', { returnObjects: true, defaultValue: [] }) as string[]
  const dateLabel = formatHotelDate(item.tourDate, monthsLong)
  const externalUrl = item.externalUrl

  const handleArrow = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!externalUrl) {
      onPress()
      return
    }
    triggerHaptic('tap')
    window.open(externalUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <article
      className={bem('cg-hotels', 'card')}
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPress()}
      aria-label={title}
    >
      <div className={bem('cg-hotels', 'image-wrap')}>
        <BackendImage
          src={item.imageUrl}
          alt=""
          className={bem('cg-hotels', 'image')}
        />
      </div>

      <div className={bem('cg-hotels', 'body')}>
        <div className={bem('cg-hotels', 'header-row')}>
          <h3 className={bem('cg-hotels', 'name')}>{title}</h3>
          {dateLabel && (
            <span className={bem('cg-hotels', 'date-badge')}>
              <img src="/app/images/news/calendar.svg" alt="" aria-hidden="true" />
              <span>{dateLabel}</span>
            </span>
          )}
        </div>

        {description && (
          <p className={bem('cg-hotels', 'description')}>{description}</p>
        )}

        {externalUrl && (
          <button
            type="button"
            className={bem('cg-hotels', 'arrow-btn')}
            onClick={handleArrow}
            aria-label={t('common:actions.open_link', { defaultValue: 'Открыть' })}
          >
            <ChevronRightIcon />
          </button>
        )}

        <div className={bem('cg-hotels', 'divider')} />

        {item.address && (
          <div className={bem('cg-hotels', 'address-row')}>
            <img src="/app/images/china-guide/location.svg" alt="" aria-hidden="true" />
            <span>{item.address}</span>
          </div>
        )}

        <button
          type="button"
          className={bem('cg-hotels', 'details-btn')}
          onClick={(e) => { e.stopPropagation(); onPress() }}
        >
          {t('common:actions.details', { defaultValue: 'Подробнее' })}
        </button>
      </div>
    </article>
  )
}

// ── Translator card (Figma 1048:12367) ────────────────────────
function TranslatorCard({
  item,
  onPress,
}: {
  item: ChinaGuideItem
  onPress: () => void
}) {
  const { i18n, t } = useTranslation(['chinaGuide', 'common'])
  const isUz = i18n.language === 'uz'
  const name = isUz && item.nameUz ? item.nameUz : item.name
  // Card shows only the skill — for a translator that's the language set.
  // Age, city, origin and description now live on the detail page.
  const languages = item.languages?.join(', ') ?? ''

  return (
    <article
      className={bem('cg-translators', 'tile')}
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPress()}
      aria-label={name}
    >
      <div className={bem('cg-translators', 'photo-wrap')}>
        <BackendImage
          src={item.imageUrl}
          alt=""
          className={bem('cg-translators', 'photo')}
        />
      </div>

      <div className={bem('cg-translators', 'info')}>
        <div className={bem('cg-translators', 'name-row')}>
          <h3 className={bem('cg-translators', 'name')}>{name}</h3>
          {item.isVerified && (
            <img
              src="/app/images/china-guide/verified-purple.svg"
              alt=""
              aria-hidden="true"
              className={bem('cg-translators', 'verified')}
            />
          )}
        </div>

        {languages && (
          <>
            <span className={bem('cg-translators', 'skills-label')}>
              {t('common:person.skills', { defaultValue: 'Навыки' })}
            </span>
            <p className={bem('cg-translators', 'skills')}>{languages}</p>
          </>
        )}
      </div>

      <button
        type="button"
        className={bem('cg-translators', 'details-btn')}
        onClick={(e) => { e.stopPropagation(); onPress() }}
      >
        {t('common:actions.details', { defaultValue: 'Подробнее' })}
      </button>
    </article>
  )
}

export function ChinaGuideListPage({ type }: ChinaGuideListPageProps) {
  const { t } = useTranslation(['chinaGuide', 'common'])
  const navigate = useNavigate()
  const { data: items, isLoading, error } = useChinaGuideList(type)

  const title = t(TITLE_KEYS[type])
  const isTours = type === 'tours'
  const isTranslators = type === 'translators'
  const isHotels = type === 'hotels'
  const isGrid = type === 'markets' || type === 'restaurants'
  const rootClass = isTours
    ? 'cg-tours'
    : isTranslators
      ? 'cg-translators'
      : isHotels
        ? 'cg-hotels'
        : isGrid
          ? 'cg-markets'
          : b

  function handleItemPress(item: ChinaGuideItem) {
    triggerHaptic('tap')
    navigate(`/china-guide/${type}/${item.id}`)
  }

  return (
    <div className={rootClass}>
      <BackButton block={rootClass} to="/china-guide" ariaLabel={t('common:actions.back')} />

      <h1 className={bem(rootClass, 'title')}>{title}</h1>

      <div className={bem(rootClass, 'content')}>
        {error ? (
          <EmptyState icon="😞" title={t('common:error.generic')} />
        ) : isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !items?.length ? (
          <EmptyState icon="🏮" title={t('chinaGuide:empty')} />
        ) : isTours ? (
          items.map(item => (
            <TourCard
              key={item.id}
              item={item}
              onOpen={() => handleItemPress(item)}
            />
          ))
        ) : isTranslators ? (
          items.map(item => (
            <TranslatorCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
            />
          ))
        ) : isHotels ? (
          items.map(item => (
            <HotelCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
            />
          ))
        ) : isGrid ? (
          items.map(item => (
            <MarketCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
            />
          ))
        ) : (
          items.map(item => (
            <ListCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
            />
          ))
        )}
      </div>
    </div>
  )
}
