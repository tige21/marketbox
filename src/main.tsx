import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTelegramSDK } from '@/utils/telegram'
import '@/styles/global.scss'

// Initialize MSW in development
async function enableMocking() {
  if (import.meta.env.DEV || import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./mocks')
    return worker.start({ onUnhandledRequest: 'bypass' })
  }
  return Promise.resolve()
}

// Initialize Telegram SDK
initTelegramSDK()

// Boot app
enableMocking().then(() => {
  const rootEl = document.getElementById('root')
  if (!rootEl) throw new Error('Root element not found')

  // App import deferred so MSW is ready before any API calls
  import('./app').then(({ App }) => {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
})
