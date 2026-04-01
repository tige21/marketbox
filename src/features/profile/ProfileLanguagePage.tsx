import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import './ProfileSubPage.scss'

const b = 'profile-sub'

export function ProfileLanguagePage() {
  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title="Язык" />
      <div className={bem(b, 'content')}>
        <span className={bem(b, 'section-label')}>Редактировать</span>
        <div className={bem(b, 'card')}>
          <div className={bem(b, 'row')}>
            <span className={bem(b, 'row-label')}>Язык</span>
            <div className={bem(b, 'row-right')}>
              <span className={bem(b, 'row-value')}>Русский</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
