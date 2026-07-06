import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { GlassHeader } from '@/components/GlassHeader'
import { Skeleton } from '@/components/Skeleton'
import { BackendImage } from '@/components/BackendImage'
import { userApi, referralApi, lessonsApi } from '@/api/endpoints'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import type { Localized, Lang } from '@/api/locale'
import { useLessonFavorites } from '@/features/favorites/hooks/useLessonFavorites'
import { triggerHaptic } from '@/utils'
import { bem, cn } from '@/utils/cn'
import './MoneyPage.scss'

const b = 'money-page'

const TG_BOT_USERNAME =
  import.meta.env['VITE_TG_BOT_USERNAME'] ?? 'MarketBox_testing_Bot'

function buildReferralLink(code: string | undefined): string {
  if (!code) return ''
  return `https://t.me/${TG_BOT_USERNAME}?start=${code}`
}

function ChevronRightIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
      <path
        d="M1 1L7 7L1 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
      <path d="M19 9.27a2 2 0 0 1 0 3.46L3 21.6A2 2 0 0 1 0 19.87V2.13A2 2 0 0 1 3 .4L19 9.27Z" fill="currentColor" />
    </svg>
  )
}

// Mirror of the lesson player's URL parser (LessonCard/LessonDetailPage):
// pulls the Kinescope id out of a share/embed URL so we can build an
// autoplay embed src.
function extractKinescopeId(url: string): string | null {
  const m = url.match(/kinescope\.io\/(?:embed\/)?([A-Za-z0-9]+)/)
  return m?.[1] ?? null
}

// Referral-page text fields are `string` per Swagger but every other content
// endpoint sends `Localized` — tolerate both so we work whichever the backend
// actually returns.
function resolveText(v: Localized | string | null | undefined, lang: Lang): string {
  if (v == null) return ''
  return typeof v === 'string' ? v : pickLocaleStr(v, lang)
}

function MoneyMainView() {
  const { t } = useTranslation('money')
  const navigate = useNavigate()
  const lang = useLang()
  const [copied, setCopied] = useState(false)
  const [refPlaying, setRefPlaying] = useState(false)

  // /api/user is the single source of truth for balance + referral fields.
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then((r) => r.data.data),
    staleTime: 60_000,
  })

  // Money hero card — first module-typed lesson the backend returns.
  // Backend renamed `course` → `module` in May 2026; the dedicated "money"
  // type was never implemented, so we read from the module list and pick
  // the first item to keep the hero card populated.
  const { data: moneyLessons = [] } = useQuery({
    queryKey: ['lessons', 'money', lang],
    queryFn: () => lessonsApi.getList({ type: 'module', lang }).then((r) => r.data.data),
    staleTime: 5 * 60_000,
  })
  const heroLesson = moneyLessons[0]
  const heroTitle = heroLesson ? pickLocaleStr(heroLesson.title, lang) : ''
  const heroThumb = heroLesson
    ? (heroLesson.video_preview ?? pickLocale(heroLesson.image, lang))
    : null
  const heroFirstDoc = heroLesson?.documents?.[0] ?? null

  // Referral promo content (title / preview / video) from /api/referral/page.
  // throwOnError:false so a down endpoint never crashes the money screen — we
  // simply fall back to the legacy lesson hero below.
  const { data: referralPage } = useQuery({
    queryKey: ['referral', 'page', lang],
    queryFn: () => referralApi.getPage().then((r) => r.data),
    staleTime: 5 * 60_000,
    throwOnError: false,
    retry: 1,
  })

  const refTitle = resolveText(referralPage?.title, lang)
  const refSubtitle = resolveText(referralPage?.preview_text, lang)
  const refPoster = referralPage?.video_preview ?? null
  const refVideoUrl = referralPage?.video_url ?? ''
  const refKinescopeId = refVideoUrl ? extractKinescopeId(refVideoUrl) : null
  const refEmbedSrc = refKinescopeId
    ? `https://kinescope.io/embed/${refKinescopeId}`
    : null
  // Non-autoplay embed: when the backend ships no `video_preview`, we render
  // this directly so Kinescope shows its own poster frame + play button
  // (instead of an empty gray box).
  const refEmbedStatic = refKinescopeId
    ? `https://kinescope.io/embed/${refKinescopeId}`
    : null
  const refHasVideo = !!refEmbedSrc
  // Prefer the referral hero whenever the backend has any content for it;
  // otherwise keep the existing lesson-derived hero (no regression).
  const showReferralHero = !!referralPage && (!!refTitle || !!refPoster || refHasVideo)

  const handleRefPlay = () => {
    if (!refHasVideo) return
    triggerHaptic('tap')
    setRefPlaying(true)
  }

  // Favorite toggle for the hero lesson (when present).
  const { isFavorite, toggle: toggleFavorite } = useLessonFavorites()
  const heroIsFavorite = heroLesson ? isFavorite(heroLesson.id) : false

  const handleHeroOpen = () => {
    if (!heroLesson) return
    triggerHaptic('tap')
    // Always navigate to the in-app detail page — it now hosts the
    // Kinescope iframe player, so the user no longer has to leave the
    // Mini App into a browser tab.
    navigate(`/lessons/${heroLesson.id}`)
  }

  const handleHeroMaterials = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!heroFirstDoc) return
    triggerHaptic('tap')
    window.open(heroFirstDoc, '_blank', 'noopener,noreferrer')
  }

  const handleHeroFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!heroLesson) return
    triggerHaptic('tap')
    toggleFavorite(heroLesson)
  }

  const link = buildReferralLink(profile?.referralCode)

  function handleCopy() {
    if (!link) return
    triggerHaptic('tap')
    navigator.clipboard.writeText(link).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function handleHistoryClick() {
    triggerHaptic('tap')
    navigate('/money/withdrawal')
  }

  const balance = profile?.balance ?? 0
  const pending = profile?.pendingAmount ?? 0
  const rejected = profile?.rejectedAmount ?? 0
  const available = Math.max(0, balance - pending)
  const currency = '₽'

  const invitedCount = profile?.referralsCount ?? 0
  const activeCount = profile?.referralsCountActive ?? 0

  return (
    <div className={b}>
      <GlassHeader size="medium" title={t('title')} />

      <div className={bem(b, 'content')}>
        {/* Referral hero — promo content + inline video from /referral/page */}
        {showReferralHero && (
          <article className={bem(b, 'hero')}>
            <div className={bem(b, 'hero-card')}>
              <h2 className={bem(b, 'hero-title')}>
                <span>{refTitle}</span>
              </h2>
              {refSubtitle && (
                <p className={bem(b, 'hero-subtitle')}>{refSubtitle}</p>
              )}
              <div className={bem(b, 'hero-thumb-wrap')}>
                {refPlaying && refEmbedSrc ? (
                  <iframe
                    className={bem(b, 'hero-iframe')}
                    src={refEmbedSrc}
                    title={refTitle}
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : refPoster ? (
                  <button
                    type="button"
                    className={bem(b, 'hero-poster')}
                    onClick={handleRefPlay}
                    aria-label={refHasVideo ? t('actions.play', { ns: 'common', defaultValue: 'Воспроизвести' }) : refTitle}
                    disabled={!refHasVideo}
                  >
                    <BackendImage
                      src={refPoster}
                      alt=""
                      className={bem(b, 'hero-thumb')}
                    />
                    {refHasVideo && (
                      <span className={bem(b, 'hero-play')} aria-hidden="true">
                        <PlayIcon />
                      </span>
                    )}
                  </button>
                ) : refEmbedStatic ? (
                  // No backend poster → embed Kinescope directly; it renders
                  // its own thumbnail and play control.
                  <iframe
                    className={bem(b, 'hero-iframe')}
                    src={refEmbedStatic}
                    title={refTitle}
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : null}
              </div>
            </div>
          </article>
        )}

        {/* Hero lesson card — fallback when referral page has no content */}
        {!showReferralHero && heroLesson && (
          <article className={bem(b, 'hero')}>
            <div
              className={bem(b, 'hero-card')}
              onClick={handleHeroOpen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleHeroOpen()
                }
              }}
              aria-label={heroTitle}
              style={{ cursor: 'pointer' }}
            >
              <h2 className={bem(b, 'hero-title')}>
                <span>{heroTitle}</span>
              </h2>
              <button
                type="button"
                className={bem(b, 'hero-heart', { active: heroIsFavorite })}
                aria-label={t('actions.favorite', { ns: 'common' })}
                aria-pressed={heroIsFavorite}
                onClick={handleHeroFavorite}
              >
                <img src="/app/images/money/heart.svg" alt="" aria-hidden="true" />
              </button>
              {heroThumb && (
                <div className={bem(b, 'hero-thumb-wrap')}>
                  <BackendImage
                    src={heroThumb}
                    alt=""
                    className={bem(b, 'hero-thumb')}
                  />
                </div>
              )}
            </div>
            {heroFirstDoc && (
              <button
                type="button"
                className={bem(b, 'hero-materials')}
                onClick={handleHeroMaterials}
              >
                <div className={bem(b, 'hero-materials-pill')}>
                  <img
                    src="/app/images/money/download.svg"
                    alt=""
                    aria-hidden="true"
                    className={bem(b, 'hero-materials-icon')}
                  />
                  <span>{t('lessons_title')}</span>
                </div>
              </button>
            )}
          </article>
        )}

        {/* Referral card */}
        {profileLoading ? (
          <Skeleton variant="rect" height={100} borderRadius={20} />
        ) : (
          <section className={bem(b, 'referral')}>
            <p className={bem(b, 'referral-hint')}>{t('referral_hint')}</p>
            <div className={bem(b, 'referral-row')}>
              <div className={bem(b, 'referral-link-box')}>
                <span className={bem(b, 'referral-link')}>
                  {link || t('referral_unavailable', {
                    defaultValue: 'Реферальный код недоступен',
                  })}
                </span>
              </div>
              <button
                type="button"
                className={bem(b, 'referral-copy')}
                onClick={handleCopy}
                aria-label={copied ? t('copied') : t('referral_copy')}
                disabled={!link}
              >
                <img src="/app/images/money/copy.svg" alt="" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {/* Stats card */}
        {profileLoading ? (
          <Skeleton variant="rect" height={220} borderRadius={20} />
        ) : (
          <section className={bem(b, 'stats')}>
            <h3 className={bem(b, 'stats-heading')}>{t('stats_title')}</h3>
            <div className={bem(b, 'stats-rows')}>
              <div className={bem(b, 'stats-row')}>
                <span className={bem(b, 'stats-label')}>{t('stats_invited')}</span>
                <span className={bem(b, 'stats-value')}>{invitedCount}</span>
              </div>
              <div className={bem(b, 'stats-divider')} />
              <div className={bem(b, 'stats-row')}>
                <span className={bem(b, 'stats-label')}>{t('stats_active')}</span>
                <span
                  className={cn(
                    bem(b, 'stats-value'),
                    bem(b, 'stats-value', { green: true }),
                  )}
                >
                  {activeCount}
                </span>
              </div>
              <div className={bem(b, 'stats-divider')} />
              <div className={bem(b, 'stats-row')}>
                <span className={bem(b, 'stats-label')}>{t('stats_commission')}</span>
                <span
                  className={cn(
                    bem(b, 'stats-value'),
                    bem(b, 'stats-value', { purple: true }),
                  )}
                >
                  {/* Fixed at 25% per business decision — not driven by tier. */}
                  25%
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Balance card */}
        {profileLoading ? (
          <Skeleton variant="rect" height={160} borderRadius={20} />
        ) : (
          <section className={bem(b, 'balance')}>
            <span className={bem(b, 'balance-label')}>{t('total_balance')}</span>
            <div className={bem(b, 'balance-row-main')}>
              <span className={bem(b, 'balance-amount')}>
                {balance.toLocaleString('ru-RU')} {currency}
              </span>
              <button
                type="button"
                className={bem(b, 'balance-withdraw')}
                onClick={handleHistoryClick}
              >
                {t('withdraw_btn')}
              </button>
            </div>
            <div className={bem(b, 'balance-divider')} />
            <div className={bem(b, 'balance-row')}>
              <span className={bem(b, 'balance-row-label')}>{t('available')}</span>
              <span className={bem(b, 'balance-row-value')}>
                {available.toLocaleString('ru-RU')} {currency}
              </span>
            </div>
            <div className={bem(b, 'balance-divider')} />
            <div className={bem(b, 'balance-row')}>
              <span className={bem(b, 'balance-row-label')}>{t('pending_label')}</span>
              <span className={bem(b, 'balance-row-value')}>
                {pending.toLocaleString('ru-RU')} {currency}
              </span>
            </div>
            {rejected > 0 && (
              <>
                <div className={bem(b, 'balance-divider')} />
                <div className={bem(b, 'balance-row')}>
                  <span className={bem(b, 'balance-row-label')}>
                    {t('rejected_label', { defaultValue: 'Отказано' })}
                  </span>
                  <span className={bem(b, 'balance-row-value')}>
                    {rejected.toLocaleString('ru-RU')} {currency}
                  </span>
                </div>
              </>
            )}
          </section>
        )}

        {/* History row */}
        {profileLoading ? (
          <Skeleton variant="rect" height={69} borderRadius={16} />
        ) : (
          <button
            type="button"
            className={bem(b, 'history-row')}
            onClick={handleHistoryClick}
          >
            <span className={bem(b, 'history-row-left')}>
              <img
                src="/app/images/money/card-icon.svg"
                alt=""
                aria-hidden="true"
                className={bem(b, 'history-row-icon')}
              />
              <span className={bem(b, 'history-row-label')}>{t('withdraw_history')}</span>
            </span>
            <span className={bem(b, 'history-row-chevron')}>
              <ChevronRightIcon />
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export function MoneyPage() {
  return (
    <Routes>
      <Route index element={<MoneyMainView />} />
    </Routes>
  )
}
