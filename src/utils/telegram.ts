import { retrieveLaunchParams, hapticFeedback, init, miniApp, viewport, swipeBehavior, closingBehavior } from '@telegram-apps/sdk-react'

// ─── Init ────────────────────────────────────────────────────────────────────

export function initTelegramSDK(): void {
  try {
    init()

    // Tell Telegram the app is ready
    miniApp.mount()
    if (miniApp.ready.isAvailable()) miniApp.ready()

    // Expand to full viewport height
    viewport.mount().then(() => {
      viewport.expand()
    })

    // CRITICAL: Disable vertical swipes to prevent swipe-to-close (Telegram 7.7+)
    if (swipeBehavior.mount.isAvailable()) {
      swipeBehavior.mount()
      if (swipeBehavior.disableVertical.isAvailable()) {
        swipeBehavior.disableVertical()
        // Retry after delay in case Telegram API wasn't ready
        setTimeout(() => {
          if (swipeBehavior.disableVertical.isAvailable()) {
            swipeBehavior.disableVertical()
          }
        }, 500)
      }
    } else {
      // Fallback for older Telegram versions via postEvent
      _postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false })
      setTimeout(() => {
        _postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false })
      }, 500)
    }

    // Enable closing confirmation dialog (extra safety layer)
    if (closingBehavior.mount.isAvailable()) {
      closingBehavior.mount()
      if (closingBehavior.enableConfirmation.isAvailable()) {
        closingBehavior.enableConfirmation()
      }
    } else {
      _postEvent('web_app_setup_closing_behavior', { need_confirmation: true })
    }

    // Set theme colors for native look
    const webApp = _getWebApp()
    if (webApp) {
      const bgColor = webApp.themeParams?.bg_color ?? '#121212'
      const headerColor = webApp.themeParams?.secondary_bg_color ?? bgColor
      if (miniApp.setBackgroundColor.isAvailable()) miniApp.setBackgroundColor(bgColor)
      if (miniApp.setHeaderColor.isAvailable()) miniApp.setHeaderColor(headerColor)
    }

  } catch {
    // Not in Telegram environment — handled by isTelegramEnvironment()
  }
}

// ─── Detection ───────────────────────────────────────────────────────────────

export function isTelegramEnvironment(): boolean {
  if (import.meta.env['VITE_MOCK_TG'] === 'true') return true
  try {
    retrieveLaunchParams()
    return true
  } catch {
    return false
  }
}

// ─── Mini App control ────────────────────────────────────────────────────────

/**
 * Close the Mini App. Disables the "are you sure?" confirmation first so the
 * exit is immediate — used by the paywall to bounce the user back to the bot
 * chat for payment. Falls back to a raw `web_app_close` postEvent on clients
 * the SDK can't address.
 */
export function closeMiniApp(): void {
  try {
    if (closingBehavior.disableConfirmation.isAvailable()) {
      closingBehavior.disableConfirmation()
    }
    if (miniApp.close.isAvailable()) {
      miniApp.close()
      return
    }
  } catch {
    // fall through to postEvent
  }
  _postEvent('web_app_close')
}

// ─── Haptics ─────────────────────────────────────────────────────────────────

export type HapticType = 'tap' | 'success' | 'error' | 'select'

export function triggerHaptic(type: HapticType): void {
  if (!hapticFeedback.isSupported()) return
  switch (type) {
    case 'tap':
      hapticFeedback.impactOccurred('light')
      break
    case 'success':
      hapticFeedback.notificationOccurred('success')
      break
    case 'error':
      hapticFeedback.notificationOccurred('error')
      break
    case 'select':
      hapticFeedback.selectionChanged()
      break
  }
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function _getWebApp() {
  return (window as any).Telegram?.WebApp ?? null
}

/**
 * Fallback postEvent for Telegram versions that don't support SDK methods.
 * Sends via iframe postMessage (web) or TelegramWebviewProxy (native).
 */
function _postEvent(eventType: string, eventData?: Record<string, unknown>): void {
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        JSON.stringify({ eventType, eventData }),
        'https://web.telegram.org'
      )
    }
    const proxy = (window as any).TelegramWebviewProxy
    if (proxy?.postEvent) {
      proxy.postEvent(eventType, eventData ? JSON.stringify(eventData) : '')
    }
  } catch {
    // Silently fail — postEvent is optional
  }
}
