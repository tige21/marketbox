import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTelegramSDK } from '@/utils/telegram'
import '@/styles/global.scss'

initTelegramSDK()

// Register the service worker in production only. The dev MSW worker shares
// the same scope, so running both in dev would mask requests we want to see.
//
// `updateViaCache: 'none'` is critical here: the production server serves
// `/app/sw.js` with `max-age=2592000 immutable` (same rule as hashed assets).
// Without this flag the browser would never re-fetch the SW and updates
// would stall until the cache expires.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/app/sw.js', { scope: '/app/', updateViaCache: 'none' })
      .then((reg) => {
        // Check for updates whenever the Mini App regains visibility, so a
        // returning user picks up new builds quickly.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => undefined)
        })
      })
      .catch((err) => console.error('[SW] register failed', err))
  })
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

import('./app').then(({ App }) => {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
