import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { Skeleton } from '@/components/Skeleton'
import { QuickActions } from './components/QuickActions'
import { CategoryList } from './components/CategoryList'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './HomePage.scss'

const b = 'home-page'

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

export function HomePage() {
  const { t } = useTranslation('home')
  const navigate = useNavigate()
  const { user, isPremium, subscriptionExpiry } = useAuthStore()

  // No mock fallback — show skeleton placeholders until the real user
  // loads (either from persisted cache or from /user after handshake).
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    : ''

  return (
    <div className={b}>
      <div className={bem(b, 'glow')} aria-hidden="true" />

      <div
            className={bem(b, 'header')}
            role="button"
            tabIndex={0}
            aria-label={t('go_to_profile')}
            onClick={() => {
              triggerHaptic('tap')
              navigate('/profile')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                triggerHaptic('tap')
                navigate('/profile')
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
                    // Photo URL failed (404 / CORS / DNS) — replace the
                    // <img> with an initials disc so we never show the
                    // generic mock avatar.
                    const img = e.currentTarget as HTMLImageElement
                    img.replaceWith(
                      Object.assign(document.createElement('span'), {
                        textContent: getInitials(displayName),
                        style: 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(172,157,255,0.18);color:#ac9dff;font-family:Gilroy,sans-serif;font-weight:700;font-size:18px;',
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

            <span className={bem(b, 'nav')} aria-hidden="true">
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
                <path
                  d="M1.5 1.5L8 8l-6.5 6.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <div className={bem(b, 'quick')}>
            <QuickActions />
          </div>

      <div className={bem(b, 'categories')}>
        <CategoryList />
      </div>
    </div>
  )
}
