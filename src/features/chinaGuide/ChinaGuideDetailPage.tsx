import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/EmptyState'
import { BackButton } from '@/components/BackButton'
import { BackendImage } from '@/components/BackendImage'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import { useChinaGuideDetail } from './hooks'
import type { ChinaGuideItem, ChinaGuideType } from '@/api/types'
import './ChinaGuideDetailPage.scss'
import './ChinaGuideTranslatorDetailPage.scss'

const b = 'china-market-detail'
const tb = 'cg-translator-detail'

// Location pin icon (20×20)
function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 1.5c-3.59 0-6.5 2.91-6.5 6.5 0 4.88 6.5 10.5 6.5 10.5s6.5-5.62 6.5-10.5c0-3.59-2.91-6.5-6.5-6.5zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

// Small pin icon (18×18) for translator hero rows
function PinIconSm() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 1.5c-3.59 0-6.5 2.91-6.5 6.5 0 4.88 6.5 10.5 6.5 10.5s6.5-5.62 6.5-10.5c0-3.59-2.91-6.5-6.5-6.5zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

// Globe/website icon (18×18)
function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="#FFFFFF" strokeWidth="1.4" />
      <path
        d="M2 10h16M10 2c2.5 2.5 3.8 5.5 3.8 8s-1.3 5.5-3.8 8c-2.5-2.5-3.8-5.5-3.8-8S7.5 4.5 10 2z"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  )
}

// Verified badge (purple star-check, inline with name)
function VerifiedBadge() {
  return (
    <img
      src="/app/images/china-guide/verified-purple.svg"
      alt=""
      aria-hidden="true"
      width={15}
      height={15}
      style={{ display: 'block', width: 15, height: 15 }}
    />
  )
}

export function ChinaGuideDetailPage() {
  const { type = 'markets', id = '' } = useParams<{ type: ChinaGuideType; id: string }>()
  const { t } = useTranslation(['chinaGuide', 'common'])
  const { data: item, isLoading, error } = useChinaGuideDetail(type as ChinaGuideType, id)

  function handleBaidu() {
    if (!item) return
    triggerHaptic('tap')
    const url = item.baiduUrl ?? (item.coordinates
      ? `https://map.baidu.com/?latlng=${item.coordinates.lat},${item.coordinates.lng}&title=${encodeURIComponent(item.name)}`
      : `https://map.baidu.com/search/${encodeURIComponent(item.name)}`)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleApple() {
    if (!item) return
    triggerHaptic('tap')
    const url = item.appleUrl ?? (item.coordinates
      ? `https://maps.apple.com/?ll=${item.coordinates.lat},${item.coordinates.lng}&q=${encodeURIComponent(item.name)}`
      : `https://maps.apple.com/?q=${encodeURIComponent(item.name)}`)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (error) {
    return (
      <div className={b}>
        <BackButton block={b} to={-1} ariaLabel={t('common:actions.back')} />
        <EmptyState icon="😞" title={t('common:error.generic')} />
      </div>
    )
  }

  if (isLoading || !item) {
    return (
      <div className={b}>
        <BackButton block={b} to={-1} ariaLabel={t('common:actions.back')} />
        <div className={bem(b, 'skeleton')} />
      </div>
    )
  }

  // ── Translator layout (Figma 1048:12438) ────────────────────
  if (item.type === 'translators') {
    return <TranslatorDetailView item={item} />
  }

  // ── Tour layout — no map buttons; primary CTA is "Участвовать" ──
  if (item.type === 'tours') {
    return <TourDetailView item={item} />
  }

  const titleLines = (item.name || '').split('\n')
  const isHotel = item.type === 'hotels'

  function handleBook() {
    if (!item || !item.externalUrl) return
    triggerHaptic('tap')
    window.open(item.externalUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={b}>
      <BackendImage
        className={bem(b, 'hero')}
        src={item.imageUrl}
        alt=""
      />

      <BackButton block={b} to={-1} ariaLabel={t('common:actions.back')} />

      <h1 className={bem(b, 'title')}>
        {titleLines.map((line, idx) => (
          <span key={idx}>
            {line}
            {idx < titleLines.length - 1 && <br />}
          </span>
        ))}
      </h1>

      <div className={bem(b, 'card')}>
        <div className={bem(b, 'location-row')}>
          <PinIcon />
          <span>{item.city}</span>
        </div>

        <span className={bem(b, 'section-label')}>{t('chinaGuide:detail.about')}</span>
        <p className={bem(b, 'description')}>{item.description}</p>

        {isHotel && (
          <button
            type="button"
            className={bem(b, 'book-btn')}
            onClick={handleBook}
            disabled={!item.externalUrl}
          >
            {t('chinaGuide:detail.book_btn')}
          </button>
        )}

        <div className={bem(b, 'route-card')}>
          <span>{t('chinaGuide:detail.navigate')}</span>
          <div className={bem(b, 'route-btns')}>
            <button
              type="button"
              className={bem(b, 'route-btn', { baidu: true })}
              onClick={handleBaidu}
            >
              {t('chinaGuide:detail.baidu_map')}
            </button>
            <button
              type="button"
              className={bem(b, 'route-btn', { apple: true })}
              onClick={handleApple}
            >
              {t('chinaGuide:detail.apple_map')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
//  Tour detail view — hero + date + description + Участвовать CTA
// ============================================================

const td = 'cg-tour-detail'

function TourDetailView({ item }: { item: ChinaGuideItem }) {
  const { t } = useTranslation(['chinaGuide', 'common'])
  const titleLines = (item.name || '').split('\n')

  function handleParticipate() {
    if (!item.externalUrl) return
    triggerHaptic('tap')
    window.open(item.externalUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={td}>
      <BackendImage
        className={bem(td, 'hero')}
        src={item.imageUrl}
        alt=""
      />

      <BackButton block={td} to={-1} ariaLabel={t('common:actions.back')} />

      <h1 className={bem(td, 'title')}>
        {titleLines.map((line, idx) => (
          <span key={idx}>
            {line}
            {idx < titleLines.length - 1 && <br />}
          </span>
        ))}
      </h1>

      <div className={bem(td, 'body')}>
        {item.description && (
          <div className={bem(td, 'description-card')}>
            <p className={bem(td, 'description')}>{item.description}</p>
          </div>
        )}

        <button
          type="button"
          className={bem(td, 'cta')}
          onClick={handleParticipate}
          disabled={!item.externalUrl}
        >
          {t('chinaGuide:list.participate_btn')}
        </button>
      </div>
    </div>
  )
}

// ============================================================
//  Translator detail view  (Figma 1048:12438)
// ============================================================

interface TranslatorDetailViewProps {
  item: ChinaGuideItem
}

function TranslatorDetailView({ item }: TranslatorDetailViewProps) {
  const { t } = useTranslation(['chinaGuide', 'common'])

  const canHelpText = Array.isArray(item.canHelp)
    ? item.canHelp.join(', ')
    : (item.canHelp ?? '')

  const languagesText = Array.isArray(item.languages)
    ? item.languages.join(' - ')
    : (item.languages ?? '')

  function handleContact() {
    triggerHaptic('tap')
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer')
      return
    }
    const tg = (item as ChinaGuideItem & { telegram?: string }).telegram
    if (tg) {
      const handle = tg.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')
      window.open(`https://t.me/${handle}`, '_blank', 'noopener,noreferrer')
      return
    }
    if (item.phone) {
      window.open(`tel:${item.phone}`, '_self')
      return
    }
  }

  return (
    <div className={tb}>
      <BackButton block={tb} to={-1} ariaLabel={t('common:actions.back')} />

      <h1 className={bem(tb, 'title')}>{t('chinaGuide:list.translators_title')}</h1>

      <div className={bem(tb, 'hero')}>
        <div className={bem(tb, 'avatar-wrap')}>
          <BackendImage
            className={bem(tb, 'avatar')}
            src={item.imageUrl}
            alt={item.name}
          />
        </div>

        <div className={bem(tb, 'hero-info')}>
          {item.city && (
            <div className={bem(tb, 'hero-row')}>
              <PinIconSm />
              <span>{item.city}</span>
            </div>
          )}

          {item.origin && (
            <div className={bem(tb, 'hero-row')}>
              <GlobeIcon />
              <span>{item.origin}</span>
            </div>
          )}
        </div>
      </div>

      <div className={bem(tb, 'identity')}>
        <h2 className={bem(tb, 'name')}>
          {item.name}
          {item.isVerified && (
            <span
              className={bem(tb, 'name-verified')}
              aria-label={t('chinaGuide:list.verified')}
            >
              <VerifiedBadge />
            </span>
          )}
        </h2>
        {typeof item.age === 'number' && (
          <span className={bem(tb, 'age')}>
            {item.age} {t('chinaGuide:list.years')}
          </span>
        )}
      </div>

      {item.aboutMe && (
        <section className={bem(tb, 'section')}>
          <span className={bem(tb, 'section-label')}>{t('chinaGuide:detail.about_me')}</span>
          <div className={bem(tb, 'section-divider')} />
          <p className={bem(tb, 'section-body')}>{item.aboutMe}</p>
        </section>
      )}

      {canHelpText && (
        <section className={bem(tb, 'section')}>
          <span className={bem(tb, 'section-label')}>{t('chinaGuide:detail.can_help')}</span>
          <div className={bem(tb, 'section-divider')} />
          <p className={bem(tb, 'section-body')}>{canHelpText}</p>
        </section>
      )}

      {languagesText && (
        <section className={bem(tb, 'section')}>
          <span className={bem(tb, 'section-label')}>{t('chinaGuide:detail.languages')}</span>
          <div className={bem(tb, 'section-divider')} />
          <p className={bem(tb, 'section-body')}>{languagesText}</p>
        </section>
      )}

      <button
        type="button"
        className={bem(tb, 'contact-btn')}
        onClick={handleContact}
      >
        {t('chinaGuide:detail.get_contact')}
      </button>
    </div>
  )
}
