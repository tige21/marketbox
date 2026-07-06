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
  // Auto-reload once a new SW takes control. The SW calls skipWaiting() +
  // clients.claim() on activate, which fires `controllerchange` here — at
  // that point the old cached assets are stale, so we reload to pull the
  // fresh index.html (and through it, the new hashed chunks). Guarded so it
  // never loops. This is what makes a deploy land without the user having
  // to manually close & reopen the Mini App.
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/app/sw.js', { scope: '/app/', updateViaCache: 'none' })
      .then((reg) => {
        // Kick an update check on load and whenever the Mini App regains
        // visibility, so a returning user picks up new builds quickly.
        reg.update().catch(() => undefined)
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
