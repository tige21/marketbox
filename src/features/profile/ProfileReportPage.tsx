import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { triggerHaptic } from '@/utils'
import { bem } from '@/utils/cn'
import './ProfileSubPage.scss'

const b = 'profile-sub'

export function ProfileReportPage() {
  const { t } = useTranslation('profile')

  const handleReport = () => {
    triggerHaptic('tap')
    window.open('https://t.me/Cashyou_help_bot', '_blank')
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title={t('pages.report_title')} />
      <div className={bem(b, 'content')}>
        <div className={bem(b, 'report-text')}>
          <p>{t('report.intro')}</p>
          <ul className={bem(b, 'report-list')}>
            <li>{t('report.step_screenshot')}</li>
            <li>{t('report.step_nickname')}</li>
            <li>{t('report.step_submit')}</li>
          </ul>
          <p>{t('report.outro')}</p>
        </div>
        <button
          className={bem(b, 'report-btn')}
          onClick={handleReport}
          type="button"
        >
          {t('pages.report_submit')}
        </button>
      </div>
    </div>
  )
}
