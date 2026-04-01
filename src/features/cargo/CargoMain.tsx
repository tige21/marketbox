import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './CargoPage.scss'

const b = 'cargo-main'

const CHAT_URL = 'https://t.me/boriga_baraka'

interface CategoryTile {
  key: string
  path: string
  hasDesc: boolean
}

const TILES: CategoryTile[] = [
  { key: 'white',       path: 'white',       hasDesc: true  },
  { key: 'logistics',   path: 'logistics',   hasDesc: false },
  { key: 'fulfillment', path: 'fulfillment', hasDesc: false },
]

export function CargoMain() {
  const { t } = useTranslation('cargo')
  const navigate = useNavigate()

  function handleTileTap(path: string) {
    triggerHaptic('tap')
    navigate(path)
  }

  function handleChatTap() {
    triggerHaptic('tap')
    window.open(CHAT_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={t('title')} size="large" />

      <div className={bem(b, 'body')}>
        <div className={bem(b, 'tiles')}>
          {TILES.map(({ key, path, hasDesc }) => (
            <button
              key={key}
              type="button"
              className={bem(b, 'tile')}
              onClick={() => handleTileTap(path)}
            >
              <div className={bem(b, 'tile-bar')}>
                <div className={bem(b, 'tile-info')}>
                  <span className={bem(b, 'tile-title')}>
                    {t(`main.${key}_title`)}
                  </span>
                  {hasDesc && (
                    <span className={bem(b, 'tile-desc')}>
                      {t(`main.${key}_desc`)}
                    </span>
                  )}
                </div>
                <span className={bem(b, 'tile-chevron')} aria-hidden="true">›</span>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={bem(b, 'chat-btn')}
          onClick={handleChatTap}
        >
          {t('main.chats_button')}
        </button>
      </div>
    </div>
  )
}
