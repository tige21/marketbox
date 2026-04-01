import { GlassHeader } from '@/components/GlassHeader'
import { triggerHaptic } from '@/utils'
import { bem } from '@/utils/cn'
import './ProfileSubPage.scss'

const b = 'profile-sub'

export function ProfileReportPage() {
  const handleReport = () => {
    triggerHaptic('tap')
    window.open('https://t.me/Cashyou_help_bot', '_blank')
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title="Подать жалобу" />
      <div className={bem(b, 'content')}>
        <div className={bem(b, 'report-text')}>
          <p>Для того чтобы подать заявку о нарушении:</p>
          <ul className={bem(b, 'report-list')}>
            <li>Сделай скриншот или видео экрана с фактом нарушения правил сообщества;</li>
            <li>Скопируй ник нарушителя;</li>
            <li>Перейди по кнопке ниже и отправь все данные.</li>
          </ul>
          <p>Служба поддержки внимательно рассмотрит твой запрос и обязательно поможет.</p>
        </div>
        <button
          className={bem(b, 'report-btn')}
          onClick={handleReport}
          type="button"
        >
          Сообщить о нарушение
        </button>
      </div>
    </div>
  )
}
