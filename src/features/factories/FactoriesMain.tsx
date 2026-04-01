import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './FactoriesPage.scss'

const b = 'factories-main'

interface CountryTile {
  code: string
  flag: string
  labelKey: string
}

const COUNTRIES: CountryTile[] = [
  { code: 'china',      flag: '🇨🇳', labelKey: 'factories:country.china' },
  { code: 'uzbekistan', flag: '🇺🇿', labelKey: 'factories:country.uzbekistan' },
  { code: 'russia',     flag: '🇷🇺', labelKey: 'factories:country.russia' },
  { code: 'kyrgyzstan', flag: '🇰🇬', labelKey: 'factories:country.kyrgyzstan' },
]

const CHAT_URL = 'https://t.me/boriga_baraka'

export function FactoriesMain() {
  const { t } = useTranslation(['factories', 'common'])
  const navigate = useNavigate()

  function handleCountryTap(code: string) {
    triggerHaptic('tap')
    navigate(code)
  }

  function handleChatTap() {
    triggerHaptic('tap')
    window.open(CHAT_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={t('factories:title')} size="large" />

      <div className={bem(b, 'body')}>
        <div className={bem(b, 'grid')}>
          {COUNTRIES.map(({ code, flag, labelKey }) => (
            <button
              key={code}
              className={bem(b, 'tile')}
              onClick={() => handleCountryTap(code)}
              type="button"
            >
              <span className={bem(b, 'tile-flag')} aria-hidden="true">{flag}</span>
              <span className={bem(b, 'tile-name')}>{t(labelKey)}</span>
            </button>
          ))}
        </div>

        <button
          className={bem(b, 'chat-btn')}
          onClick={handleChatTap}
          type="button"
        >
          {t('factories:chats_button')}
        </button>
      </div>
    </div>
  )
}
