import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import './ProfileSubPage.scss'

const b = 'profile-sub'

export function ProfileFaqPage() {
  return (
    <div className={b}>
      <GlassHeader showBack title="Вопрос - Ответ" />
      <div className={bem(b, 'content')} />
    </div>
  )
}
