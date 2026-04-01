import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { triggerHaptic } from '@/utils'
import { userApi } from '@/api/endpoints'
import { Avatar } from '@/components/Avatar'
import { bem, cn } from '@/utils/cn'
import './ProfilePage.scss'

const b = 'profile-page'

function ChevronRightIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1 1L7 7L1 13" stroke="rgba(250,250,250,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface RowProps {
  iconSrc?: string
  label: string
  value?: string
  showChevron?: boolean
  isLink?: boolean
  onClick?: () => void
}

function Row({ iconSrc, label, value, showChevron = true, isLink = false, onClick }: RowProps) {
  const handleClick = () => {
    if (onClick) {
      triggerHaptic('tap')
      onClick()
    }
  }

  return (
    <div
      className={cn(bem(b, 'row'), onClick && bem(b, 'row', { interactive: true }))}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') handleClick() } : undefined}
    >
      {iconSrc && (
        <img src={iconSrc} alt="" aria-hidden="true" className={bem(b, 'row-icon')} />
      )}
      <span className={cn(bem(b, 'row-label'), isLink && bem(b, 'row-label') + '--link')}>
        {label}
      </span>
      <div className={bem(b, 'row-right')}>
        {value && <span className={bem(b, 'row-value')}>{value}</span>}
        {showChevron && <ChevronRightIcon />}
      </div>
    </div>
  )
}

export function ProfileMain() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then((r) => r.data.data),
  })

  const firstName = profileData?.firstName ?? user?.firstName ?? ''
  const photoUrl = profileData?.photoUrl ?? user?.photoUrl

  return (
    <div className={b}>
      <div className={bem(b, 'header')}>
        <h1 className={bem(b, 'header-title')}>МОЙ ПРОФИЛЬ</h1>
      </div>

      <div className={bem(b, 'content')}>
        <div className={bem(b, 'avatar-wrap')}>
          <Avatar src={photoUrl} name={firstName} size="xl" className={bem(b, 'avatar')} />
        </div>

        <section className={bem(b, 'section')}>
          <span className={bem(b, 'section-label')}>МОЙ АККАУНТ</span>
          <div className={bem(b, 'card')}>
            <Row
              iconSrc="/images/profile/account.svg"
              label="Имя и Фамилия"
              value={firstName || undefined}
              onClick={() => navigate('/profile/edit')}
            />
            <Row
              iconSrc="/images/profile/language.svg"
              label="Язык"
              onClick={() => navigate('/profile/language')}
            />
            <Row
              iconSrc="/images/profile/payment.svg"
              label="Платежная Информация"
              onClick={() => navigate('/profile/payment')}
            />
            <Row
              iconSrc="/images/profile/ticket.svg"
              label="Подписка"
              value="до 16.05.2026"
              showChevron={false}
            />
          </div>
        </section>

        <section className={bem(b, 'section')}>
          <span className={bem(b, 'section-label')}>Информация</span>
          <div className={bem(b, 'card')}>
            <Row
              iconSrc="/images/profile/support.svg"
              label="Служба заботы"
              isLink
              onClick={() => window.open('https://t.me/Cashyou_help_bot', '_blank')}
            />
            <Row
              iconSrc="/images/profile/security.svg"
              label="Правила сообщество"
              onClick={() => navigate('/profile/rules')}
            />
            <Row
              iconSrc="/images/profile/info.svg"
              label="Вопрос - Ответ"
              onClick={() => navigate('/profile/faq')}
            />
            <Row
              iconSrc="/images/profile/report.svg"
              label="Сообщить о нарушении"
              onClick={() => navigate('/profile/report')}
            />
            <Row
              label="Оферта и политики"
              onClick={() => navigate('/profile/terms')}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
