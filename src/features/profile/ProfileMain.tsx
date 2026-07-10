import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { retryAuth } from '@/app/AuthProvider'
import { triggerHaptic, openTelegramLink } from '@/utils'
import { userApi } from '@/api/endpoints'
import { bem, cn } from '@/utils/cn'
import { Skeleton } from '@/components'
import './ProfilePage.scss'

const b = 'profile-page'

// ISO date → DD.MM.YYYY (mirrors the home-header formatter). Guards against an
// unparseable value so a bad string can't render "NaN.NaN.NaN".
function formatDateDMY(isoDate: string): string {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${d.getFullYear()}`
}

function formatProfileError(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status ?? 'no-response'
    const method = err.config?.method?.toUpperCase() ?? 'GET'
    const baseURL = err.config?.baseURL ?? ''
    const url = err.config?.url ?? ''
    const data = err.response?.data
    const body = data
      ? typeof data === 'string' ? data : JSON.stringify(data)
      : err.message
    return `[/me ${status}] ${method} ${baseURL}${url}\n${body}`
  }
  if (err instanceof Error) return `[/me] ${err.message}`
  return `[/me] ${String(err)}`
}

function ChevronRightIcon() {
  return (
    <span className={bem(b, 'chevron')} aria-hidden="true">
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 1L7 7L1 13"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

interface RowProps {
  iconSrc?: string
  label: string
  value?: string
  showChevron?: boolean
  isLink?: boolean
  onClick?: () => void
}

function Row({ iconSrc, label, value, showChevron = true, isLink = false, onClick }: RowProps) {
  const handleClick = () => {
    if (onClick) {
      triggerHaptic('tap')
      onClick()
    }
  }

  return (
    <div
      className={cn(bem(b, 'row'), onClick && bem(b, 'row', { interactive: true }))}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter') handleClick()
            }
          : undefined
      }
    >
      <div className={bem(b, 'row-left')}>
        {iconSrc && (
          <img src={iconSrc} alt="" aria-hidden="true" className={bem(b, 'row-icon')} />
        )}
        <span
          className={cn(bem(b, 'row-label'), isLink && `${bem(b, 'row-label')}--link`)}
        >
          {label}
        </span>
      </div>
      <div className={bem(b, 'row-right')}>
        {value && <span className={bem(b, 'row-value')}>{value}</span>}
        {showChevron && <ChevronRightIcon />}
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className={bem(b, 'row')} aria-hidden="true">
      <div className={bem(b, 'row-left')} style={{ gap: '8.53px', display: 'flex', alignItems: 'center' }}>
        {/* Icon placeholder — 25.6px square */}
        <Skeleton variant="rect" width={25.6} height={25.6} borderRadius={6} />
        {/* Label text */}
        <Skeleton variant="text" width={120} height={14} borderRadius={4} />
      </div>
      <div className={bem(b, 'row-right')}>
        {/* Value / chevron placeholder */}
        <Skeleton variant="text" width={60} height={14} borderRadius={4} />
      </div>
    </div>
  )
}

function ProfileMainSkeleton() {
  return (
    <div className={bem(b, 'content')}>
      {/* Avatar — matches __avatar-wrap: 106.6px circle */}
      <Skeleton variant="circle" width={106.6} height={106.6} />

      <div className={bem(b, 'sections')}>
        {/* Section 1 — МОЙ АККАУНТ: 4 rows */}
        <section className={bem(b, 'section')}>
          <Skeleton variant="text" width={110} height={11} borderRadius={3} />
          <div className={bem(b, 'card')}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </section>

        {/* Section 2 — Информация: 5 rows */}
        <section className={bem(b, 'section')}>
          <Skeleton variant="text" width={90} height={11} borderRadius={3} />
          <div className={bem(b, 'card')}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </section>
      </div>
    </div>
  )
}

export function ProfileMain() {
  const navigate = useNavigate()
  const { t } = useTranslation('profile')
  const user = useAuthStore((s) => s.user)
  const errorDetail = useAuthStore((s) => s.errorDetail)
  // Subscription expiry comes from the auth handshake (same source the home
  // header uses), NOT a hardcoded literal. The date was previously pinned to
  // "16.05.2026" so it never reflected renewals.
  const subscriptionExpiry = useAuthStore((s) => s.subscriptionExpiry)
  const [retrying, setRetrying] = useState(false)
  const [copied, setCopied] = useState(false)

  // Don't throw on this query: when auth handshake is broken the backend
  // returns 401 from /me, and a thrown error here would cascade up to the
  // global ErrorBoundary and hide the auth-error block we render below.
  // Fall back to authStore.user (whatever was cached from the last good
  // session) so the page still renders.
  const { data: profileData, isLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then((r) => r.data.data),
    throwOnError: false,
    retry: false,
  })

  const firstName = profileData?.firstName ?? user?.firstName ?? ''
  const lastName = profileData?.lastName ?? user?.lastName ?? ''
  // No mock fallback. If neither React Query nor authStore has a photo,
  // we render the initials instead (handled below).
  const photoUrl = profileData?.photoUrl ?? user?.photoUrl ?? null

  // Combine handshake error (from authStore) with profile fetch error
  // (from /me) so the user sees whichever broke. Axios errors carry
  // status + URL — tease that out for copy-paste forwarding to backend.
  const profileErrorText = profileError ? formatProfileError(profileError) : null
  const combinedError = [errorDetail, profileErrorText].filter(Boolean).join('\n\n---\n\n')

  const handleCopyError = async () => {
    if (!combinedError) return
    try {
      await navigator.clipboard.writeText(combinedError)
      setCopied(true)
      triggerHaptic('select')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  const handleRetryAuth = () => {
    triggerHaptic('tap')
    setRetrying(true)
    retryAuth()
    setTimeout(() => setRetrying(false), 1500)
  }

  return (
    <div className={b}>
      <div className={bem(b, 'header')}>
        <h1 className={bem(b, 'header-title')}>{t('header_title')}</h1>
      </div>

      {isLoading ? (
        <ProfileMainSkeleton />
      ) : (
        <div className={bem(b, 'content')}>
          <div className={bem(b, 'avatar-wrap')}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={firstName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  // Photo URL failed — replace with initials disc.
                  const img = e.currentTarget as HTMLImageElement
                  const initials = [firstName, lastName]
                    .filter(Boolean)
                    .map((s) => s[0] ?? '')
                    .join('')
                    .toUpperCase()
                  img.replaceWith(
                    Object.assign(document.createElement('span'), {
                      textContent: initials || '·',
                      style: 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(172,157,255,0.18);color:#ac9dff;font-family:Gilroy,sans-serif;font-weight:700;font-size:32px;',
                    }),
                  )
                }}
              />
            ) : (
              <span className={bem(b, 'avatar-initials')}>
                {[firstName, lastName].filter(Boolean).map((s) => s[0] ?? '').join('').toUpperCase() || '·'}
              </span>
            )}
          </div>

          {combinedError && (
            <section className={bem(b, 'auth-error')}>
              <div className={bem(b, 'auth-error-header')}>
                <span className={bem(b, 'auth-error-title')}>Ошибка авторизации</span>
                <button
                  type="button"
                  className={bem(b, 'auth-error-retry')}
                  onClick={handleRetryAuth}
                  disabled={retrying}
                >
                  {retrying ? 'Пробуем…' : 'Повторить'}
                </button>
              </div>
              <pre
                className={bem(b, 'auth-error-detail')}
                onClick={handleCopyError}
                title="Tap to copy"
              >{combinedError}</pre>
              <button
                type="button"
                className={bem(b, 'auth-error-copy')}
                onClick={handleCopyError}
              >
                {copied ? 'Скопировано' : 'Скопировать ошибку'}
              </button>
            </section>
          )}

          <div className={bem(b, 'sections')}>
            <section className={bem(b, 'section')}>
              <span className={bem(b, 'section-label')}>{t('section_account')}</span>
              <div className={bem(b, 'card')}>
                <Row
                  iconSrc="/app/images/profile/account.svg"
                  label={t('rows.name_lastname')}
                  value={firstName || undefined}
                  onClick={() => navigate('/profile/edit')}
                />
                <Row
                  iconSrc="/app/images/profile/language.svg"
                  label={t('settings.language')}
                  onClick={() => navigate('/profile/language')}
                />
                <Row
                  iconSrc="/app/images/profile/payment.svg"
                  label={t('rows.payment_info')}
                  onClick={() => navigate('/profile/payment')}
                />
                <Row
                  iconSrc="/app/images/profile/ticket.svg"
                  label={t('rows.subscription')}
                  value={
                    subscriptionExpiry
                      ? t('rows.subscription_until', { date: formatDateDMY(subscriptionExpiry) })
                      : t('rows.subscription_inactive')
                  }
                  showChevron={false}
                />
              </div>
            </section>

            <section className={bem(b, 'section')}>
              <span className={bem(b, 'section-label')}>{t('section_information')}</span>
              <div className={bem(b, 'card')}>
                <Row
                  iconSrc="/app/images/profile/support.svg"
                  label={t('rows.support')}
                  isLink
                  onClick={() => {
                    triggerHaptic('tap')
                    openTelegramLink('https://t.me/marketbox_asistant_bot')
                  }}
                />
                <Row
                  iconSrc="/app/images/profile/security.svg"
                  label={t('rows.rules')}
                  onClick={() => navigate('/profile/rules')}
                />
                <Row
                  iconSrc="/app/images/profile/info.svg"
                  label={t('rows.faq')}
                  onClick={() => navigate('/profile/faq')}
                />
                <Row
                  iconSrc="/app/images/profile/report.svg"
                  label={t('rows.report')}
                  onClick={() => navigate('/profile/report')}
                />
                <Row
                  label={t('rows.terms')}
                  onClick={() => navigate('/profile/terms')}
                />
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
