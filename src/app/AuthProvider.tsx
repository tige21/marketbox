import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import apiClient from '@/api/client'
import { authApi } from '@/api/endpoints'
import { useAuthStore } from '@/stores/authStore'
import { isTelegramEnvironment } from '@/utils/telegram'
import type { TgUser, Subscription, BackendUser } from '@/api/types'

// Map the backend `user` payload (parsed from Telegram `initData.user`)
// onto the camelCase shape the rest of the app already uses. Both
// snake_case and camelCase are accepted because the Swagger schema
// types the field as `object` without further detail.
function normalizeUser(raw: Record<string, unknown> | undefined): TgUser {
  const r = raw ?? {}
  const get = (a: string, b: string) => (r[a] ?? r[b]) as string | undefined
  return {
    id: Number(r['id'] ?? 0),
    firstName: String(r['first_name'] ?? r['firstName'] ?? ''),
    lastName: get('last_name', 'lastName'),
    username: r['username'] as string | undefined,
    photoUrl: get('photo_url', 'photoUrl'),
    languageCode: get('language_code', 'languageCode'),
  }
}

const DEFAULT_SUBSCRIPTION: Subscription = {
  isPremium: false,
  expiresAt: null,
  plan: 'free',
}

async function performAuth(): Promise<{
  token: string
  user: TgUser
  subscription: Subscription
} | null> {
  if (!isTelegramEnvironment()) return null

  if (import.meta.env['VITE_MOCK_TG'] === 'true') {
    return {
      token: 'dev-session',
      user: {
        id: 0,
        firstName: 'BORIGA',
        lastName: 'BARAKA',
        username: 'boriga_baraka',
        photoUrl: '/app/images/home/avatar.png',
        languageCode: 'ru',
      },
      subscription: {
        isPremium: true,
        expiresAt: '2026-05-16T12:00:00Z',
        plan: 'premium',
        // Dev knob for the home-header contest UI (0 = all locked).
        consecutiveMonths: 2,
      },
    }
  }

  const { retrieveRawInitData } = await import('@telegram-apps/sdk-react')
  const initDataRaw = retrieveRawInitData() ?? ''
  if (!initDataRaw) {
    throw new Error('No initData available from Telegram SDK')
  }

  const apiBase = (import.meta.env['VITE_API_URL'] as string | undefined) ?? ''
  const refMatch = initDataRaw.match(/(?:^|&)start_param=([^&]+)/)
  const refSuffix = refMatch?.[1] ? `&ref=${refMatch[1]}` : ''
  const fullUrl = `${apiBase}/api/auth/telegram/callback?${initDataRaw}${refSuffix}`

  try {
    const response = await authApi.loginWithTelegram(initDataRaw)
    const body = response.data
    if (!body || !body.token) {
      throw new Error('Auth callback returned no token')
    }

    const fallbackUser = normalizeUser(body.user)
    let user = fallbackUser
    let subscription = DEFAULT_SUBSCRIPTION

    try {
      const me = await apiClient.get<{
        user?: BackendUser
        subscription?: {
          is_actual?: boolean
          date_expired?: string | null
          type?: 'standard' | 'full_access' | null
          unlocked_module_level?: number | null
          consecutive_months?: number | null
        }
      }>('/api/user', { headers: { Authorization: `Bearer ${body.token}` } })

      const raw = me.data?.user
      if (raw) {
        user = {
          id: Number(raw.id ?? fallbackUser.id ?? 0),
          firstName: raw.name ?? raw.telegram_first_name ?? fallbackUser.firstName ?? '',
          lastName: raw.surname ?? raw.telegram_last_name ?? fallbackUser.lastName,
          username: raw.telegram_username ?? fallbackUser.username,
          photoUrl: raw.telegram_photo_url ?? fallbackUser.photoUrl,
          languageCode: fallbackUser.languageCode,
        }
      }
      const sub = me.data?.subscription
      if (sub) {
        if (sub.is_actual && sub.consecutive_months == null) {
          console.warn('[header] consecutive_months missing in /api/user subscription')
        }
        subscription = {
          isPremium: !!sub.is_actual,
          expiresAt: sub.date_expired ?? null,
          plan: sub.is_actual ? 'premium' : 'free',
          type: sub.type ?? null,
          unlockedModuleLevel: sub.unlocked_module_level ?? null,
          consecutiveMonths: sub.consecutive_months ?? null,
        }
      }
    } catch {
      // /user may 401 right after the callback — keep fallback user.
    }

    return { token: body.token, user, subscription }
  } catch (e) {
    const detail = `${describeAuthErrorRaw(e)}\n\nGET ${fullUrl}\n\ninitData:\n${initDataRaw}`
    const wrapped = new Error(detail)
    ;(wrapped as Error & { authDetail?: string }).authDetail = detail
    throw wrapped
  }
}

function describeAuthErrorRaw(e: unknown): string {
  if (isAxiosError(e)) {
    const status = e.response?.status
    const data = e.response?.data
    let body = ''
    if (typeof data === 'string') body = data
    else if (data && typeof data === 'object') body = JSON.stringify(data)
    return `HTTP ${status ?? 'no-response'}${body ? ` — ${body}` : ''}`
  }
  if (e instanceof Error) return e.message
  return String(e)
}

// Module-level callable so non-AuthProvider components (e.g. ProfileMain)
// can re-trigger the handshake. Set by AuthProvider's effect on mount.
let retryAuthRef: (() => void) | null = null
export function retryAuth() {
  retryAuthRef?.()
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { t } = useTranslation('common')
  const { authState, errorDetail, token, user, setAuth, setSoftError, setNonTelegram, setLoading, setRevalidating } = useAuthStore()
  const [retryNonce, setRetryNonce] = useState(0)

  // Design-preview routes (`/preview/*`) skip the TG gate so we can review
  // layouts in a regular browser without a real Telegram session.
  const isPreviewRoute =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/preview/')

  const hasCachedSession = !!token && !!user

  const handleRetry = useCallback(() => {
    setLoading()
    setRetryNonce((n) => n + 1)
  }, [setLoading])

  // Make retry callable from anywhere.
  retryAuthRef = handleRetry

  useEffect(() => {
    if (isPreviewRoute) return

    if (!isTelegramEnvironment()) {
      setNonTelegram()
      return
    }

    // Cache hit: render the app immediately with cached session, then
    // refresh in the background. If the background refresh fails, keep
    // the cache and surface a soft error (visible in Profile).
    if (hasCachedSession) {
      // Mark state as 'ok' without changing user data so HomePage/header
      // render real user instantly, no mock flash. `revalidating` suppresses
      // the premium gate while the fresh subscription check is in flight — a
      // user who just paid must not see the payment modal flash with the
      // stale (cached) isPremium=false before performAuth lands.
      setRevalidating(true)
      useAuthStore.setState({ authState: 'ok' })

      performAuth()
        .then((data) => {
          if (data) setAuth(data.token, data.user, data.subscription)
        })
        .catch((e: unknown) => {
          const detail = (e as Error & { authDetail?: string })?.authDetail
            ?? (e instanceof Error ? e.message : String(e))
          setSoftError(detail)
        })
        .finally(() => setRevalidating(false))
      return
    }

    // No cache: must complete handshake before rendering. Show error gate
    // on failure so the user can copy the error and retry.
    performAuth()
      .then((data) => {
        if (data) setAuth(data.token, data.user, data.subscription)
      })
      .catch((e: unknown) => {
        const detail = (e as Error & { authDetail?: string })?.authDetail
          ?? (e instanceof Error ? e.message : String(e))
        useAuthStore.getState().setError(detail)
      })
  }, [setAuth, setSoftError, setNonTelegram, setRevalidating, hasCachedSession, isPreviewRoute, retryNonce])

  if (isPreviewRoute) return <>{children}</>

  const handleCopy = useCallback(async () => {
    if (!errorDetail) return
    try {
      await navigator.clipboard.writeText(errorDetail)
    } catch {
      // ignore clipboard errors
    }
  }, [errorDetail])

  if (authState === 'non-telegram') {
    const botUrl = `https://t.me/${import.meta.env['VITE_TG_BOT_USERNAME'] ?? 'marketbox_bot'}`
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: '#121212',
        color: '#fafafa',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px',
        textAlign: 'center',
        gap: '16px',
      }}>
        <div style={{ fontSize: '48px' }}>&#128241;</div>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{t('auth.open_in_tg_title')}</h1>
        <p style={{ color: 'rgba(250,250,250,0.7)', fontSize: '14px' }}>
          {t('auth.open_in_tg_body')}
        </p>
        <a
          href={botUrl}
          style={{
            background: '#ac9dff',
            color: '#121212',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          {t('auth.open_in_tg_cta')}
        </a>
      </div>
    )
  }

  if (authState === 'error') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: '#121212',
        color: '#fafafa',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px',
        textAlign: 'center',
        gap: '16px',
      }}>
        <div style={{ fontSize: '48px' }}>&#9888;&#65039;</div>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{t('auth.error_title')}</h1>
        <p style={{ color: 'rgba(250,250,250,0.7)', fontSize: '14px' }}>
          {t('auth.error_body')}
        </p>
        {errorDetail && (
          <>
            <pre
              onClick={handleCopy}
              style={{
                margin: 0,
                padding: '10px 12px',
                maxWidth: '90vw',
                maxHeight: '40vh',
                overflow: 'auto',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '10px',
                color: 'rgba(250,250,250,0.85)',
                fontSize: '10px',
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                textAlign: 'left',
                cursor: 'copy',
                userSelect: 'all',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
              title="Tap to copy"
            >{errorDetail}</pre>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#fafafa',
                padding: '8px 14px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t('auth.copy_debug')}
            </button>
          </>
        )}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              background: '#ac9dff',
              color: '#121212',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t('auth.retry')}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
