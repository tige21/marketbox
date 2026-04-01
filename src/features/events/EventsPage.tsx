import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { EmptyState } from '@/components/EmptyState'
import { eventsApi } from '@/api/endpoints'
import type { MarketboxEvent } from '@/api/types'
import { bem } from '@/utils/cn'
import { useHaptic } from '@/hooks/useHaptic'
import './EventsPage.scss'

const b = 'events-page'

// ─── Helpers ────────────────────────────────────────────────

function formatDateRange(start: string, end: string): string {
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    const s = startDate.toLocaleDateString('ru-RU', opts)
    const e = endDate.toLocaleDateString('ru-RU', opts)
    return s === e ? s : `${s} – ${e}`
  } catch {
    return start
  }
}

function formatPrice(price: number, currency: string, freeLabel: string): string {
  if (price === 0) return freeLabel
  return price.toLocaleString('ru-RU') + ' ' + currency
}

// ─── Event Card ──────────────────────────────────────────────

interface EventCardProps {
  event: MarketboxEvent
  onClick: () => void
}

function EventCard({ event, onClick }: EventCardProps) {
  const { t, i18n } = useTranslation('events')
  const haptic = useHaptic()
  const isUz = i18n.language === 'uz'

  const title = isUz && event.titleUz ? event.titleUz : event.title
  const description = isUz && event.descriptionUz ? event.descriptionUz : event.description
  const typeLabel = t(`type.${event.type}`, { defaultValue: event.type })
  const dateLabel = formatDateRange(event.startDate, event.endDate)
  const priceLabel = formatPrice(event.price, event.currency, t('free'))

  const handleClick = () => {
    haptic.tap()
    onClick()
  }

  return (
    <article
      className={bem(b, 'card', { featured: event.isFeatured, premium: event.isPremium })}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={title}
    >
      <div className={bem(b, 'card-image-wrap')}>
        <img
          src={event.imageUrl}
          alt={title}
          className={bem(b, 'card-image')}
          loading="lazy"
          decoding="async"
        />

        <div className={bem(b, 'card-badges')}>
          <span className={bem(b, 'type-badge')}>{typeLabel}</span>
          {event.isOnline && (
            <span className={bem(b, 'online-badge')}>{t('online')}</span>
          )}
        </div>

        <span className={bem(b, 'date-badge')}>
          📅 {dateLabel}
        </span>
      </div>

      <div className={bem(b, 'card-body')}>
        <h3 className={bem(b, 'card-title')}>{title}</h3>

        <div className={bem(b, 'card-location')}>
          <span aria-hidden="true">📍</span>
          <span>{event.location}</span>
        </div>

        <p className={bem(b, 'card-description')}>{description}</p>

        <div className={bem(b, 'card-footer')}>
          <span className={bem(b, 'card-price', { free: event.price === 0 })}>
            {priceLabel}
          </span>
          <button type="button" className={bem(b, 'read-more-btn')}>
            {t('read_more')}
          </button>
        </div>
      </div>
    </article>
  )
}

// ─── Skeleton ────────────────────────────────────────────────

function EventCardSkeleton() {
  return (
    <div className={bem(b, 'card-skeleton')}>
      <div className="skeleton skeleton--variant-rect" style={{ height: 200, borderRadius: 0 }} />
      <div className={bem(b, 'skeleton-body')}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton skeleton--variant-rect" style={{ width: 72, height: 22, borderRadius: 11 }} />
          <div className="skeleton skeleton--variant-rect" style={{ width: 64, height: 22, borderRadius: 11 }} />
        </div>
        <div className="skeleton skeleton--variant-text" style={{ height: 18, width: '80%' }} />
        <div className="skeleton skeleton--variant-text" style={{ height: 14, width: '50%' }} />
        <div className="skeleton skeleton--variant-text" style={{ height: 14, width: '90%' }} />
        <div className="skeleton skeleton--variant-text" style={{ height: 14, width: '70%' }} />
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────

export function EventsPage() {
  const { t } = useTranslation('events')

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', 'list'],
    queryFn: () => eventsApi.getList().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  })

  const events: MarketboxEvent[] = data?.data ?? []

  const handleEventClick = (id: string) => {
    // Detail navigation can be wired up when an EventDetailPage exists
    console.debug('Open event', id)
  }

  if (error) {
    return (
      <div className={b}>
        <GlassHeader showBack title={t('title')} />
        <div className={bem(b, 'content')}>
          <EmptyState icon="🗓️" title={t('common:error.generic')} />
        </div>
      </div>
    )
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={t('title')} />

      <div className={bem(b, 'content')}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
        ) : events.length === 0 ? (
          <EmptyState icon="🗓️" title={t('common:empty.title')} />
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => handleEventClick(event.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
