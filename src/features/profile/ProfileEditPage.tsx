import { GlassHeader } from '@/components/GlassHeader'
import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/api/endpoints'
import { bem } from '@/utils/cn'
import './ProfileSubPage.scss'

const b = 'profile-sub'

export function ProfileEditPage() {
  const { user } = useAuthStore()
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then((r) => r.data.data),
  })

  const firstName = profileData?.firstName ?? user?.firstName ?? '—'
  const lastName = profileData?.lastName ?? user?.lastName ?? '—'

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title="Имя и фамилия" />
      <div className={bem(b, 'content')}>
        <span className={bem(b, 'section-label')}>Редактировать</span>
        <div className={bem(b, 'card')}>
          <div className={bem(b, 'row')}>
            <span className={bem(b, 'row-label')}>Имя</span>
            <div className={bem(b, 'row-right')}>
              <span className={bem(b, 'row-value')}>{firstName}</span>
            </div>
          </div>
          <div className={bem(b, 'divider')} />
          <div className={bem(b, 'row')}>
            <span className={bem(b, 'row-label')}>Фамилия</span>
            <div className={bem(b, 'row-right')}>
              <span className={bem(b, 'row-value')}>{lastName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
