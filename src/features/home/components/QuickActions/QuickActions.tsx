import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { bem, cn } from '@/utils/cn'
import { useHaptic } from '@/hooks'
import './QuickActions.scss'

interface QuickAction {
  id: string
  labelKey: string
  route: string
  variant: 'glass' | 'solid'
  icon?: string
  emoji?: string
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'news',      labelKey: 'quick_news',      route: '/news', variant: 'glass', icon: '/app/images/home/qa-news-icon.svg' },
  { id: 'assistant', labelKey: 'quick_assistant', route: 'tg:https://t.me/marketbox_asistant_bot', variant: 'solid', emoji: '👩🏻‍💻' },
  { id: 'refer',     labelKey: 'quick_refer',     route: '/money', variant: 'glass', icon: '/app/images/home/qa-refer-icon.svg' },
]

const b = 'quick-actions'

function openTelegramUrl(url: string) {
  // `openTelegramLink` is documented to close the Mini App. To keep our app
  // alive in the background, use `openLink` — Telegram opens the URL in the
  // in-app browser (or external), which then redirects to the bot chat in a
  // new screen, while leaving our Mini App still mounted.
  const tg = (window as unknown as {
    Telegram?: { WebApp?: { openLink?: (u: string) => void; openTelegramLink?: (u: string) => void } }
  }).Telegram?.WebApp
  if (tg?.openLink) tg.openLink(url)
  else if (tg?.openTelegramLink) tg.openTelegramLink(url)
  else window.open(url, '_blank', 'noopener,noreferrer')
}

export function QuickActions() {
  const { t } = useTranslation('home')
  const navigate = useNavigate()
  const haptic = useHaptic()

  const handleClick = (route: string) => {
    haptic.tap()
    if (route === '#') return
    if (route.startsWith('tg:')) {
      openTelegramUrl(route.slice(3))
      return
    }
    navigate(route)
  }

  return (
    <div className={b}>
      {QUICK_ACTIONS.map((action) => (
        <div key={action.id} className={bem(b, 'cell')}>
          <button
            type="button"
            className={cn(
              bem(b, 'item'),
              bem(b, 'item', { [`variant-${action.variant}`]: true }),
            )}
            onClick={() => handleClick(action.route)}
            aria-label={t(action.labelKey)}
          >
            {action.emoji ? (
              <span className={bem(b, 'emoji')} aria-hidden="true">
                {action.emoji}
              </span>
            ) : (
              <img
                src={action.icon}
                alt=""
                className={bem(b, 'icon')}
                width={32}
                height={32}
                aria-hidden="true"
              />
            )}
          </button>
          <span className={bem(b, 'label')}>{t(action.labelKey)}</span>
        </div>
      ))}
    </div>
  )
}
