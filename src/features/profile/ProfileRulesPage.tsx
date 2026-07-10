import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import { linkifyTelegram } from './linkifyTelegram'
import './ProfileSubPage.scss'

const b = 'profile-sub'

export function ProfileRulesPage() {
  const { t } = useTranslation('profile')
  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title={t('pages.rules_title')} />
      <div className={bem(b, 'content')}>
        <div className={bem(b, 'rules-box')}>{linkifyTelegram(t('rules_text'))}</div>
      </div>
    </div>
  )
}
