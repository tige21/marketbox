import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { EmptyState } from '@/components/EmptyState'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import { useChinaGuideDetail } from './hooks'
import type { ChinaGuideType } from '@/api/types'
import './ChinaGuideDetailPage.scss'

const b = 'cg-detail'

// ── Back icon ─────────────────────────────────────────────────
function BackIcon() {
  return (
    <svg width="10" height="17" viewBox="0 0 10 17" fill="none" aria-hidden="true">
      <path d="M8.5 1.5L1.5 8.5L8.5 15.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Pin icon ──────────────────────────────────────────────────
function PinIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
      <path d="M5.5 0C3.01 0 1 2.01 1 4.5c0 3.38 4.5 8.5 4.5 8.5s4.5-5.12 4.5-8.5C10 2.01 7.99 0 5.5 0zm0 6.11A1.61 1.61 0 1 1 5.5 2.89a1.61 1.61 0 0 1 0 3.22z" fill="currentColor" />
    </svg>
  )
}

// ── Verified icon ─────────────────────────────────────────────
function VerifiedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#ac9dff" />
      <path d="M5 8l2.5 2.5L11 5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Phone icon ────────────────────────────────────────────────
function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M13 10.33v1.84A1.22 1.22 0 0 1 11.65 13.4a12.1 12.1 0 0 1-5.28-1.88 11.92 11.92 0 0 1-3.67-3.67A12.1 12.1 0 0 1 .82 2.51 1.22 1.22 0 0 1 2.01.6h1.84c.6 0 1.12.44 1.21 1.03.08.5.22 1 .41 1.47a1.22 1.22 0 0 1-.27 1.29L4.43 5.16a9.77 9.77 0 0 0 3.67 3.67l.77-.77a1.22 1.22 0 0 1 1.29-.27c.47.19.97.33 1.47.41.6.1 1.04.63 1.03 1.22l.34-.09z" fill="currentColor" />
    </svg>
  )
}

// ── WeChat icon ───────────────────────────────────────────────
function WeChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.5 4C5.36 4 2 7.13 2 11c0 2.08 1.01 3.93 2.6 5.22l-.6 2.28 2.49-1.24A7.7 7.7 0 0 0 9.5 18c.23 0 .46-.01.68-.03a5.83 5.83 0 0 1-.18-1.47c0-3.31 2.86-6 6.38-6 .28 0 .55.02.82.05C16.63 6.83 13.38 4 9.5 4z" fill="currentColor" />
      <path d="M16.38 10.5c-2.83 0-5.12 1.94-5.12 4.33 0 2.4 2.29 4.34 5.12 4.34.75 0 1.47-.15 2.12-.42l2 1-.49-1.8A4.15 4.15 0 0 0 21.5 14.83c0-2.39-2.29-4.33-5.12-4.33z" fill="currentColor" />
    </svg>
  )
}

// ── Map icon ──────────────────────────────────────────────────
function MapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1C4.24 1 2 3.24 2 6c0 4 5 8 5 8s5-4 5-8c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 1 1 7 4.25a1.75 1.75 0 0 1 0 3.5z" fill="currentColor" />
    </svg>
  )
}

export function ChinaGuideDetailPage() {
  const { type = 'markets', id = '' } = useParams<{ type: ChinaGuideType; id: string }>()
  const { t } = useTranslation(['chinaGuide', 'common'])
  const navigate = useNavigate()

  const { data: item, isLoading, error } = useChinaGuideDetail(type as ChinaGuideType, id)

  const isTranslator = type === 'translators'
  const isTour = type === 'tours'
  const isPlace = !isTranslator && !isTour

  // ── Header title based on type ───────────────────────────
  const TITLE_KEYS: Record<string, string> = {
    markets: 'chinaGuide:list.markets_title',
    hotels: 'chinaGuide:list.hotels_title',
    restaurants: 'chinaGuide:list.restaurants_title',
    tours: 'chinaGuide:list.tours_title',
    translators: 'chinaGuide:list.translators_title',
  }
  const headerTitle = t(TITLE_KEYS[type] ?? 'chinaGuide:title')

  function handlePhone() {
    if (!item?.phone) return
    triggerHaptic('tap')
    window.open(`tel:${item.phone}`)
  }

  function handleWeChat() {
    if (!item?.wechat) return
    triggerHaptic('tap')
    window.open(`https://wa.me/${item.wechat}`, '_blank', 'noopener,noreferrer')
  }

  function handleBaiduMap() {
    if (!item?.coordinates) return
    triggerHaptic('tap')
    const { lat, lng } = item.coordinates
    window.open(`https://map.baidu.com/?latlng=${lat},${lng}&title=${encodeURIComponent(item.name)}`, '_blank', 'noopener,noreferrer')
  }

  function handleAppleMap() {
    if (!item?.coordinates) return
    triggerHaptic('tap')
    const { lat, lng } = item.coordinates
    window.open(`https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(item.name)}`, '_blank', 'noopener,noreferrer')
  }

  function handleTelegram() {
    triggerHaptic('tap')
    window.open('https://t.me/boriga_baraka', '_blank', 'noopener,noreferrer')
  }

  if (error) {
    return (
      <div className={b}>
        <GlassHeader showBack title={headerTitle} />
        <EmptyState icon="😞" title={t('common:error.generic')} />
      </div>
    )
  }

  if (isLoading || !item) {
    return (
      <div className={b}>
        <GlassHeader showBack title={headerTitle} />
        <div className={bem(b, 'skeleton')} />
      </div>
    )
  }

  // ── Translator layout ──────────────────────────────────────
  if (isTranslator) {
    return (
      <div className={b}>
        <GlassHeader showBack title={headerTitle} />

        <div className={bem(b, 'body')}>
          {/* Avatar section */}
          <div className={bem(b, 'trans-hero')}>
            <div className={bem(b, 'trans-avatar-wrap')}>
              <img
                className={bem(b, 'trans-avatar')}
                src={item.imageUrl}
                alt={item.name}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className={bem(b, 'trans-badges')}>
              <span className={bem(b, 'trans-city-badge')}>
                <PinIcon />
                {item.city}
              </span>
              {item.origin && (
                <span className={bem(b, 'trans-origin-badge')}>{item.origin}</span>
              )}
            </div>
          </div>

          {/* Name + verified + age */}
          <div className={bem(b, 'trans-identity')}>
            <div className={bem(b, 'trans-name-row')}>
              <h1 className={bem(b, 'trans-name')}>{item.name}</h1>
              {item.isVerified && <VerifiedIcon />}
            </div>
            {item.age !== undefined && (
              <p className={bem(b, 'trans-age')}>{item.age} {t('chinaGuide:list.years')}</p>
            )}
          </div>

          {/* About */}
          {item.aboutMe && (
            <div className={bem(b, 'section')}>
              <h2 className={bem(b, 'section-title')}>{t('chinaGuide:detail.about_me')}</h2>
              <div className={bem(b, 'divider')} />
              <p className={bem(b, 'section-text')}>{item.aboutMe}</p>
            </div>
          )}

          {/* Can help */}
          {item.canHelp && item.canHelp.length > 0 && (
            <div className={bem(b, 'section')}>
              <h2 className={bem(b, 'section-title')}>{t('chinaGuide:detail.can_help')}</h2>
              <div className={bem(b, 'divider')} />
              <ul className={bem(b, 'help-list')}>
                {item.canHelp.map(help => (
                  <li key={help} className={bem(b, 'help-item')}>
                    <span className={bem(b, 'help-dot')} />
                    {help}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {item.languages && item.languages.length > 0 && (
            <div className={bem(b, 'section')}>
              <h2 className={bem(b, 'section-title')}>{t('chinaGuide:detail.languages')}</h2>
              <div className={bem(b, 'divider')} />
              <div className={bem(b, 'lang-tags')}>
                {item.languages.map(lang => (
                  <span key={lang} className={bem(b, 'lang-tag')}>{lang}</span>
                ))}
              </div>
            </div>
          )}

          {/* Get contact button */}
          <div className={bem(b, 'trans-footer')}>
            <button
              type="button"
              className={bem(b, 'contact-btn')}
              onClick={handleTelegram}
            >
              {t('chinaGuide:detail.get_contact')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Tour layout ────────────────────────────────────────────
  if (isTour) {
    return (
      <div className={b}>
        {/* Hero image with back button overlay */}
        <div className={bem(b, 'hero')}>
          <img
            className={bem(b, 'hero-img')}
            src={item.imageUrl}
            alt={item.name}
            loading="eager"
            decoding="async"
          />
          <div className={bem(b, 'hero-overlay')} />
          <button
            type="button"
            className={bem(b, 'hero-back')}
            onClick={() => { triggerHaptic('tap'); navigate(-1) }}
            aria-label={t('common:actions.back')}
          >
            <BackIcon />
          </button>
          <div className={bem(b, 'hero-info')}>
            {item.tourDate && (
              <span className={bem(b, 'tour-date-badge')}>{item.tourDate}</span>
            )}
            <h1 className={bem(b, 'hero-name')}>{item.name}</h1>
            <div className={bem(b, 'hero-location')}>
              <PinIcon />
              <span>{item.city}</span>
            </div>
          </div>
        </div>

        <div className={bem(b, 'body')}>
          {/* Description */}
          <div className={bem(b, 'section')}>
            <h2 className={bem(b, 'section-title')}>{t('chinaGuide:detail.about')}</h2>
            <p className={bem(b, 'section-text')}>{item.description}</p>
          </div>

          {/* Tour details */}
          <div className={bem(b, 'info-rows')}>
            {item.workingHours && (
              <div className={bem(b, 'info-row')}>
                <span className={bem(b, 'info-label')}>{t('chinaGuide:detail.duration')}</span>
                <span className={bem(b, 'info-value')}>{item.workingHours}</span>
              </div>
            )}
            {item.maxParticipants && (
              <div className={bem(b, 'info-row')}>
                <span className={bem(b, 'info-label')}>{t('chinaGuide:detail.max_participants')}</span>
                <span className={bem(b, 'info-value')}>{item.maxParticipants} чел.</span>
              </div>
            )}
            <div className={bem(b, 'info-row')}>
              <span className={bem(b, 'info-label')}>{t('chinaGuide:detail.price_range')}</span>
              <span className={bem(b, 'info-value')}>{item.priceRange}</span>
            </div>
          </div>

          {/* Contacts */}
          {(item.phone || item.wechat) && (
            <div className={bem(b, 'section')}>
              <h2 className={bem(b, 'section-title')}>{t('chinaGuide:detail.contacts')}</h2>
              <div className={bem(b, 'contact-row')}>
                {item.phone && (
                  <button type="button" className={bem(b, 'contact-pill', { phone: true })} onClick={handlePhone}>
                    <PhoneIcon />
                    <span>{item.phone}</span>
                  </button>
                )}
                {item.wechat && (
                  <button type="button" className={bem(b, 'contact-pill', { wechat: true })} onClick={handleWeChat}>
                    <WeChatIcon />
                    <span>{item.wechat}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Participate button */}
          <button type="button" className={bem(b, 'participate-btn')} onClick={handleTelegram}>
            {t('chinaGuide:list.participate_btn')}
          </button>
        </div>
      </div>
    )
  }

  // ── Place layout (markets / hotels / restaurants) ──────────
  return (
    <div className={b}>
      {/* Hero image with overlaid back button, name, location */}
      <div className={bem(b, 'hero')}>
        <img
          className={bem(b, 'hero-img')}
          src={item.imageUrl}
          alt={item.name}
          loading="eager"
          decoding="async"
        />
        <div className={bem(b, 'hero-overlay')} />
        <button
          type="button"
          className={bem(b, 'hero-back')}
          onClick={() => { triggerHaptic('tap'); navigate(-1) }}
          aria-label={t('common:actions.back')}
        >
          <BackIcon />
        </button>
        <div className={bem(b, 'hero-info')}>
          {item.isPremium && (
            <span className={bem(b, 'premium-badge')}>PREMIUM</span>
          )}
          <h1 className={bem(b, 'hero-name')}>{item.name}</h1>
          <div className={bem(b, 'hero-location')}>
            <PinIcon />
            <span>{item.city}{item.address ? ` · ${item.address}` : ''}</span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className={bem(b, 'body')}>
        {/* Description */}
        <div className={bem(b, 'section')}>
          <h2 className={bem(b, 'section-title')}>{t('chinaGuide:detail.about')}</h2>
          <p className={bem(b, 'section-text')}>{item.description}</p>
        </div>

        {/* Info rows */}
        <div className={bem(b, 'info-rows')}>
          {item.workingHours && (
            <div className={bem(b, 'info-row')}>
              <span className={bem(b, 'info-label')}>{t('chinaGuide:detail.working_hours')}</span>
              <span className={bem(b, 'info-value')}>{item.workingHours}</span>
            </div>
          )}
          {item.priceRange && (
            <div className={bem(b, 'info-row')}>
              <span className={bem(b, 'info-label')}>{t('chinaGuide:detail.price_range')}</span>
              <span className={bem(b, 'info-value')}>{item.priceRange}</span>
            </div>
          )}
          <div className={bem(b, 'info-row')}>
            <span className={bem(b, 'info-label')}>{t('chinaGuide:detail.rating')}</span>
            <span className={bem(b, 'info-value')}>⭐ {item.rating} ({item.reviewsCount} {t('chinaGuide:detail.reviews')})</span>
          </div>
        </div>

        {/* Contacts */}
        {(item.phone || item.wechat) && (
          <div className={bem(b, 'section')}>
            <h2 className={bem(b, 'section-title')}>{t('chinaGuide:detail.contacts')}</h2>
            <div className={bem(b, 'contact-row')}>
              {item.phone && (
                <button type="button" className={bem(b, 'contact-pill', { phone: true })} onClick={handlePhone}>
                  <PhoneIcon />
                  <span>{item.phone}</span>
                </button>
              )}
              {item.wechat && (
                <button type="button" className={bem(b, 'contact-pill', { wechat: true })} onClick={handleWeChat}>
                  <WeChatIcon />
                  <span>{item.wechat}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Map navigation — only if coordinates exist */}
        {isPlace && item.coordinates && (
          <div className={bem(b, 'section')}>
            <h2 className={bem(b, 'section-title')}>{t('chinaGuide:detail.navigate')}</h2>
            <div className={bem(b, 'map-btns')}>
              <button type="button" className={bem(b, 'map-btn', { baidu: true })} onClick={handleBaiduMap}>
                <MapIcon />
                <span>{t('chinaGuide:detail.baidu_map')}</span>
              </button>
              <button type="button" className={bem(b, 'map-btn', { apple: true })} onClick={handleAppleMap}>
                <MapIcon />
                <span>{t('chinaGuide:detail.apple_map')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
