import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { Skeleton } from '@/components/Skeleton'
import { BackendImage } from '@/components/BackendImage'
import { bem, cn } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { useSubscriptionGifts } from '../../hooks'
import './HomeHeader.scss'

const b = 'home-header'

function formatDateDMY(isoDate: string): string {
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

// Progress-row node for an UNLOCKED step: purple disc with an open padlock
// (the shackle swung open). The locked state keeps the existing closed-lock
// asset (check.svg) — bumping its opacity alone read as "still locked", which
// was the reported bug.
function LockOpenGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
      <circle cx="9.5" cy="9.5" r="9.5" fill="#8E7CFF" />
      <rect x="6.1" y="9" width="6.8" height="5" rx="1.3" fill="#fff" />
      <path
        d="M7.5 9V7.4a2 2 0 0 1 3.5-1.35"
        stroke="#fff"
        strokeWidth="1.05"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * Home-screen header. Collapsed: avatar / name / PREMIUM / expiry. Tap
 * toggles the contest panel — subscription-streak progress ("N/M") and the
 * monthly prize ladder, both driven by GET /subscription-gifts.
 */
export function HomeHeader() {
  const { t } = useTranslation('home')
  const user = useAuthStore((s) => s.user)
  const isPremium = useAuthStore((s) => s.isPremium)
  const subscriptionExpiry = useAuthStore((s) => s.subscriptionExpiry)

  const [expanded, setExpanded] = useState(false)

  const { data: giftsData, isLoading: giftsLoading, isError: giftsError } =
    useSubscriptionGifts()

  useEffect(() => {
    if (giftsError) console.warn('[contest] gifts unavailable — rendering panel without grid')
  }, [giftsError])

  // Sort the ladder by `order`; `passed_count` is the unlocked count = the
  // numerator, the ladder length is the denominator ("N/M").
  const gifts = useMemo(
    () => [...(giftsData?.data ?? [])].sort((a, b2) => a.order - b2.order),
    [giftsData],
  )
  const total = gifts.length
  const passedCount = Math.min(Math.max(0, giftsData?.passed_count ?? 0), total)
  const barPct = total > 0 ? (passedCount / total) * 100 : 0

  // A ladder item is unlocked if the backend flagged it OR its position is
  // within `passed_count`. The two backend signals can disagree
  // (passed_count = 1 while every is_passed = false), which left the "N/M"
  // bar showing progress while the first prize/lock stayed closed. Deriving
  // from passedCount keeps the tiles and the bottom locks consistent with
  // the counter and opens them step-by-step as the streak grows.
  const isUnlocked = (gift: { is_passed?: boolean }, i: number) =>
    gift.is_passed === true || i < passedCount

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    : ''

  const toggle = () => {
    triggerHaptic('tap')
    setExpanded((v) => !v)
  }

  return (
    <section className={cn(b, expanded && bem(b, undefined, { expanded: true }))}>
      {/* Top row — the always-visible header; tap toggles the panel. */}
      <div
        className={bem(b, 'top')}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={t('contest.toggle_aria')}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
      >
        <div className={bem(b, 'avatar')}>
          {!user ? (
            <Skeleton variant="circle" width="100%" height="100%" />
          ) : user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={displayName}
              width={56}
              height={56}
              loading="eager"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                // Photo URL failed (404 / CORS / DNS) — replace the <img>
                // with an initials disc so we never show a broken image.
                const img = e.currentTarget as HTMLImageElement
                img.replaceWith(
                  Object.assign(document.createElement('span'), {
                    textContent: getInitials(displayName),
                    style:
                      'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(172,157,255,0.18);color:#ac9dff;font-family:Gilroy,sans-serif;font-weight:700;font-size:18px;',
                  }),
                )
              }}
            />
          ) : (
            <span className={bem(b, 'avatar-initials')}>
              {getInitials(displayName) || '·'}
            </span>
          )}
        </div>

        <div className={bem(b, 'info')}>
          {user ? (
            <span className={bem(b, 'name')}>{displayName}</span>
          ) : (
            <Skeleton variant="text" width={140} height={18} borderRadius={6} />
          )}
          <div className={bem(b, 'meta')}>
            {isPremium && (
              <span className={bem(b, 'premium-badge')}>
                <img
                  src="/app/images/home/premium-star.svg"
                  alt=""
                  className={bem(b, 'premium-star')}
                  width={12}
                  height={12}
                  aria-hidden="true"
                />
                PREMIUM
              </span>
            )}
            {subscriptionExpiry && (
              <span className={bem(b, 'expiry')}>
                {t('expiry_until', { date: formatDateDMY(subscriptionExpiry) })}
              </span>
            )}
          </div>
        </div>

        <span
          className={cn(bem(b, 'chevron'), expanded && bem(b, 'chevron', { up: true }))}
          aria-hidden="true"
        >
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
            <path
              d="M1.5 1.5L8 8l6.5-6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {/* Expanded contest panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className={bem(b, 'panel')}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={bem(b, 'panel-inner')}>
              {/* Progress row + bar */}
              <div className={bem(b, 'progress-row')}>
                <span className={bem(b, 'progress-label')}>{t('contest.stepwise')}</span>
                <span className={bem(b, 'progress-count')}>
                  {passedCount}/{total}
                </span>
              </div>
              <div
                className={bem(b, 'bar')}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={passedCount}
              >
                <div className={bem(b, 'bar-fill')} style={{ width: `${barPct}%` }} />
              </div>

              {/* Contest titles */}
              <h3 className={bem(b, 'contest-title')}>{t('contest.title')}</h3>
              <p className={bem(b, 'contest-subtitle')}>{t('contest.subtitle')}</p>

              {/* Prize ladder — dynamic from /subscription-gifts */}
              {giftsLoading ? (
                <div className={bem(b, 'prizes')}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className={bem(b, 'prize')}>
                      <Skeleton variant="rect" width="100%" height={90} borderRadius={8} />
                    </div>
                  ))}
                </div>
              ) : total === 0 ? (
                <p className={bem(b, 'prizes-empty')}>{t('contest.empty')}</p>
              ) : (
                <>
                  <div
                    className={bem(b, 'prizes')}
                    style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
                  >
                    {gifts.map((gift, i) => (
                      <div key={gift.id} className={bem(b, 'prize')}>
                        <span className={bem(b, 'prize-month')}>
                          {t('contest.month_label', { n: gift.order || i + 1 })}
                        </span>
                        <span className={bem(b, 'prize-premium')}>PREMIUM</span>
                        <span className={bem(b, 'prize-text')}>{gift.title}</span>
                        <span className={bem(b, 'prize-media')}>
                          <BackendImage src={gift.image} alt={gift.title} />
                        </span>
                        <span
                          className={cn(
                            bem(b, 'prize-status'),
                            isUnlocked(gift, i) && bem(b, 'prize-status', { unlocked: true }),
                          )}
                        >
                          {isUnlocked(gift, i) ? t('contest.unlocked') : t('contest.locked')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom checks row */}
                  <div
                    className={bem(b, 'checks')}
                    style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
                  >
                    <span className={bem(b, 'checks-line')} aria-hidden="true" />
                    {gifts.map((gift, i) => {
                      const open = isUnlocked(gift, i)
                      return (
                        <span
                          key={gift.id}
                          aria-hidden="true"
                          className={cn(
                            bem(b, 'check'),
                            open && bem(b, 'check', { done: true }),
                          )}
                        >
                          {open ? (
                            <LockOpenGlyph />
                          ) : (
                            <img src="/app/images/home/contest/check.svg" alt="" />
                          )}
                        </span>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
