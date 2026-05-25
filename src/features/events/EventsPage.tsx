import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/EmptyState'
import { BackButton } from '@/components/BackButton'
import { BackendImage } from '@/components/BackendImage'
import { Skeleton } from '@/components/Skeleton'
import type { BackendEvent } from '@/api/types'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { bem } from '@/utils/cn'
import { useHaptic } from '@/hooks/useHaptic'
import { formatBadgeDate } from '@/utils'
import { useEvents, useEvent } from './hooks'
import './EventsPage.scss'

const b = 'events-page'

interface EventCardProps {
  event: BackendEvent
}

function EventCard({ event }: EventCardProps) {
  const { t } = useTranslation(['events', 'common'])
  const lang = useLang()
  const haptic = useHaptic()
  const navigate = useNavigate()
  const title = pickLocaleStr(event.title, lang)
  const image = pickLocale(event.image, lang)
  const typeLabel = (pickLocaleStr(event.type, lang) || 'EVENT').toUpperCase()
  const isWide = typeLabel !== 'EXHIBITION' && typeLabel !== 'ВЫСТАВКА'
  const dateLabel = formatBadgeDate(event.date)

  const handleCardClick = () => {
    haptic.tap()
    navigate(`/events/${event.id}`)
  }

  return (
    <article className={bem(b, 'item')}>
      <div
        className={bem(b, 'card')}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCardClick()
          }
        }}
        aria-label={title}
      >
        <BackendImage
          src={image}
          alt=""
          className={bem(b, 'card-image')}
        />

        <div className={bem(b, 'glass-bar')}>
          <div className={bem(b, 'glass-meta')}>
            <span className={bem(b, 'type-badge', { wide: isWide })}>{typeLabel}</span>
            <span className={bem(b, 'date-badge')}>
              <img src="/app/images/news/calendar.svg" alt="" aria-hidden="true" />
              <span>{dateLabel}</span>
            </span>
          </div>
          <p className={bem(b, 'glass-text')}>{title}</p>
        </div>
      </div>

      <button
        type="button"
        className={bem(b, 'details-btn')}
        onClick={(e) => { e.stopPropagation(); handleCardClick() }}
      >
        {t('common:actions.details', { defaultValue: 'Подробнее' })}
      </button>
    </article>
  )
}

function EventsList() {
  const { t } = useTranslation(['events', 'common'])
  const { data: events = [], isLoading, error } = useEvents()

  return (
    <div className={b}>
      <BackButton block={b} to="/" />

      <h1 className={bem(b, 'title')}>
        <span className={bem(b, 'title-line', { primary: true })}>{t('events:title_line_1')}</span>
        <span className={bem(b, 'title-line', { secondary: true })}>{t('events:title_line_2')}</span>
      </h1>

      <div className={bem(b, 'content')}>
        {error ? (
          <EmptyState icon="📅" title={t('common:error.generic')} />
        ) : isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={bem(b, 'card-skeleton')} />
          ))
        ) : events.length === 0 ? (
          <EmptyState icon="📅" title={t('common:empty.title')} />
        ) : (
          events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  )
}

const bd = 'event-detail'

function EventDetail() {
  const { t } = useTranslation(['events', 'common'])
  const lang = useLang()
  const haptic = useHaptic()
  const { id } = useParams<{ id: string }>()
  const numId = id ? Number(id) : undefined
  const validId = Number.isFinite(numId) && numId! > 0 ? numId : undefined
  const { data: event, isLoading, error } = useEvent(validId)

  const title = event ? pickLocaleStr(event.title, lang) : ''
  const description = event
    ? pickLocaleStr(event.description ?? '', lang) ||
      pickLocaleStr(event.preview_text, lang)
    : ''
  const image = event ? pickLocale(event.image, lang) : null
  const ctaLabel = event ? pickLocaleStr(event.title_url, lang) : ''
  const ctaUrl = event?.url ?? null
  const dateLabel = event ? formatBadgeDate(event.date) : ''

  const handleCta = () => {
    if (!ctaUrl) return
    haptic.tap()
    window.open(ctaUrl, '_blank', 'noopener,noreferrer')
  }

  if (error) {
    return (
      <div className={bd}>
        <BackButton block={bd} to="/events" />
        <EmptyState icon="😞" title={t('common:error.generic')} />
      </div>
    )
  }

  return (
    <div className={bd}>
      <BackButton block={bd} to="/events" />

      <div className={bem(bd, 'body')}>
        {isLoading || !event ? (
          <>
            <Skeleton variant="rect" height={240} borderRadius={20} />
            <Skeleton variant="rect" height={28} width="60%" borderRadius={6} />
            <Skeleton variant="rect" height={120} borderRadius={12} />
          </>
        ) : (
          <>
            {image && (
              <BackendImage
                src={image}
                alt={title}
                className={bem(bd, 'image')}
              />
            )}

            {dateLabel && (
              <span className={bem(bd, 'date')}>
                <img src="/app/images/news/calendar.svg" alt="" aria-hidden="true" />
                <span>{dateLabel}</span>
              </span>
            )}

            <h1 className={bem(bd, 'title')}>{title}</h1>

            {description && (
              <p className={bem(bd, 'description')}>{description}</p>
            )}

            {ctaUrl && (
              <button
                type="button"
                className={bem(bd, 'cta')}
                onClick={handleCta}
              >
                {ctaLabel || t('events:cta')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function EventsPage() {
  return (
    <Routes>
      <Route index element={<EventsList />} />
      <Route path=":id" element={<EventDetail />} />
    </Routes>
  )
}
