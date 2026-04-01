import { type ReactNode, useEffect } from 'react'
import { authApi } from '@/api/endpoints'
import { useAuthStore } from '@/stores/authStore'
import { isTelegramEnvironment } from '@/utils/telegram'

// In development/mock mode, we simulate a successful auth
async function performAuth() {
  if (!isTelegramEnvironment()) {
    return null // will trigger non-telegram state
  }

  let initDataRaw = 'mock_init_data'
  if (import.meta.env['VITE_MOCK_TG'] !== 'true') {
    const { retrieveRawInitData } = await import('@telegram-apps/sdk-react')
    initDataRaw = retrieveRawInitData() ?? ''
  }

  const response = await authApi.loginWithTelegram({ initData: initDataRaw })
  return response.data.data
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { authState, setAuth, setError, setNonTelegram } = useAuthStore()

  useEffect(() => {
    if (!isTelegramEnvironment()) {
      setNonTelegram()
      return
    }

    performAuth()
      .then((data) => {
        if (data) {
          setAuth(data.token, data.user, data.subscription)
        }
      })
      .catch(() => {
        setError()
      })
  }, [setAuth, setError, setNonTelegram])

  if (authState === 'loading') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: '#121212',
        color: '#fafafa',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div>Загрузка...</div>
      </div>
    )
  }

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
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Откройте в Telegram</h1>
        <p style={{ color: 'rgba(250,250,250,0.7)', fontSize: '14px' }}>
          Это приложение работает только внутри Telegram
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
          Открыть в Telegram
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
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Ошибка авторизации</h1>
        <p style={{ color: 'rgba(250,250,250,0.7)', fontSize: '14px' }}>
          Перезапустите приложение в Telegram
        </p>
      </div>
    )
  }

  return <>{children}</>
}
