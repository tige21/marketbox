import { GlassHeader } from '@/components/GlassHeader'
import { triggerHaptic } from '@/utils'
import { bem } from '@/utils/cn'
import './ProfileSubPage.scss'

const b = 'profile-sub'

const TERMS_ITEMS = [
  'Политика конфиденциальность',
  'Согласие на обработку персональных данных',
  'Согласие на рассылку',
] as const

export function ProfileTermsPage() {
  const handleItem = (label: string) => {
    triggerHaptic('tap')
    // Navigation to specific terms documents will be wired up when URLs are available
    void label
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title="Оферта и политика" />
      <div className={bem(b, 'content')}>
        <div className={bem(b, 'terms-list')}>
          {TERMS_ITEMS.map((label) => (
            <button
              key={label}
              className={bem(b, 'terms-item')}
              onClick={() => handleItem(label)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
