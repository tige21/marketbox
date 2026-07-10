import type { ReactNode } from 'react'
import { triggerHaptic, openTelegramLink } from '@/utils'

// Turn plain-text `@handle` mentions and `t.me/...` URLs inside locale strings
// (FAQ answers, community rules) into tappable links that open the Telegram
// account. A single capturing group means String.split() interleaves the
// matched tokens at odd indices, so we don't need a stateful global .test().
const TG_TOKEN = /(@[a-zA-Z0-9_]{3,}|https?:\/\/t\.me\/[^\s)]+)/g

function toUrl(token: string): string {
  return token.startsWith('@') ? `https://t.me/${token.slice(1)}` : token
}

export function linkifyTelegram(text: string): ReactNode[] {
  return text.split(TG_TOKEN).map((part, i) => {
    // Odd indices are the captured @handle / t.me tokens.
    if (i % 2 === 1) {
      const url = toUrl(part)
      return (
        <button
          key={i}
          type="button"
          className="tg-inline-link"
          onClick={(e) => {
            e.stopPropagation()
            triggerHaptic('tap')
            openTelegramLink(url)
          }}
        >
          {part}
        </button>
      )
    }
    return part
  })
}
