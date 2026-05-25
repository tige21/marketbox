import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { triggerHaptic } from '@/utils'
import { bem } from '@/utils/cn'
import './ProfileSubPage.scss'

const b = 'profile-sub'

// Documents are hosted on Yandex.Disk for now; the rows redirect there
// in the user's external browser (TG mini-app `openLink` -> Safari).
const TERMS_LINKS: Array<{ key: 'privacy' | 'personal_data'; url: string }> = [
  { key: 'privacy', url: 'https://disk.yandex.ru/i/SQ7GqXMrnFczxw' },
  { key: 'personal_data', url: 'https://disk.yandex.ru/i/vVrhu1t6z0NEOg' },
]

export function ProfileTermsPage() {
  const { t } = useTranslation('profile')

  const handleItem = (url: string) => {
    triggerHaptic('tap')
    // Yandex.Disk is a regular https URL — Telegram WebApp prefers
    // `openLink` (opens in the user's default browser); fall back to
    // window.open for non-TG environments.
    const tg = (window as unknown as {
      Telegram?: { WebApp?: { openLink?: (u: string) => void } }
    }).Telegram?.WebApp
    if (tg?.openLink) tg.openLink(url)
    else window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title={t('pages.terms_title')} />
      <div className={bem(b, 'content')}>
        <div className={bem(b, 'terms-list')}>
          {TERMS_LINKS.map(({ key, url }) => (
            <button
              key={key}
              className={bem(b, 'terms-item')}
              onClick={() => handleItem(url)}
              type="button"
            >
              {t(`terms_items.${key}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
