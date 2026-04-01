import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './CargoPage.scss'

const b = 'cargo-white'

interface VideoLesson {
  title: string
}

interface TeamMember {
  name: string
  role: string
  exp: string
  photo: string
}

const VIDEO_LESSONS: VideoLesson[] = [
  { title: 'Видеоурок 1 Названия' },
  { title: 'Видеоурок 2 Названия' },
  { title: 'Видеоурок 3 Названия' },
]

const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Кузин Максим',          role: 'Руководитель Отдела Логистики', exp: '4 года', photo: '/images/cargo/team-1.jpg' },
  { name: 'Солосовский Николай',   role: 'Старший менеджер',              exp: '4 года', photo: '/images/cargo/team-2.jpg' },
  { name: 'Далгатов Адам',         role: 'Менеджер по продажам',          exp: '4 года', photo: '/images/cargo/team-3.jpg' },
  { name: 'Морозова Анна',         role: 'Менеджер по продажам',          exp: '4 года', photo: '/images/cargo/team-4.jpg' },
  { name: 'Анастасия',             role: 'Старший брокер',                exp: '4 года', photo: '/images/cargo/team-5.jpg' },
  { name: 'Анастасия',             role: 'Старший брокер',                exp: '4 года', photo: '/images/cargo/team-5.jpg' },
]

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5 19.79 19.79 0 01.07 2.82 2 2 0 012 .66h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.61-1.61a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function CargoWhitePage() {
  const { t } = useTranslation('cargo')
  const [likedLessons, setLikedLessons] = useState<Set<number>>(new Set())

  function toggleLike(index: number) {
    triggerHaptic('tap')
    setLikedLessons(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={t('white_page.title')} size="medium" />

      <div className={bem(b, 'body')}>

        {/* Video lesson cards */}
        {VIDEO_LESSONS.map((lesson, index) => (
          <div key={index} className={bem(b, 'lesson-card')}>
            <div className={bem(b, 'lesson-thumb')}>
              <span className={bem(b, 'lesson-title-overlay')}>{lesson.title}</span>
              <img
                src="/images/cargo/video-thumb.jpg"
                alt={lesson.title}
                className={bem(b, 'lesson-img')}
                loading="lazy"
              />
              <button
                type="button"
                className={bem(b, 'lesson-heart')}
                onClick={() => toggleLike(index)}
                aria-label="В избранное"
              >
                <HeartIcon filled={likedLessons.has(index)} />
              </button>
            </div>
            <div className={bem(b, 'lesson-footer')}>
              <BookIcon />
              <span>{t('white_page.materials_label')}</span>
            </div>
          </div>
        ))}

        {/* Company info card */}
        <div className={bem(b, 'company-card')}>
          <h2 className={bem(b, 'company-name')}>{t('white_page.company_name')}</h2>
          <p className={bem(b, 'company-tagline')}>{t('white_page.company_tagline')}</p>
          <p className={bem(b, 'company-desc')}>{t('white_page.company_desc')}</p>
        </div>

        {/* Team section */}
        <section className={bem(b, 'team-section')}>
          <h2 className={bem(b, 'section-title')}>{t('white_page.team_title')}</h2>
          <div className={bem(b, 'team-grid')}>
            {TEAM_MEMBERS.map((member, index) => (
              <div key={index} className={bem(b, 'member-card')}>
                <img
                  src={member.photo}
                  alt={member.name}
                  className={bem(b, 'member-avatar')}
                  loading="lazy"
                />
                <p className={bem(b, 'member-name')}>{member.name}</p>
                <p className={bem(b, 'member-role')}>{member.role}</p>
                <p className={bem(b, 'member-exp')}>{member.exp}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contacts section */}
        <section className={bem(b, 'contacts-section')}>
          <h2 className={bem(b, 'contacts-title')}>{t('white_page.contacts_title')}</h2>
          <div className={bem(b, 'contacts-list')}>
            <div className={bem(b, 'contact-row')}>
              <span className={bem(b, 'contact-icon')}><PhoneIcon /></span>
              <span className={bem(b, 'contact-text')}>{t('white_page.phone')}</span>
            </div>
            <div className={bem(b, 'contact-row')}>
              <span className={bem(b, 'contact-icon')}><EmailIcon /></span>
              <span className={bem(b, 'contact-text')}>{t('white_page.email')}</span>
            </div>
            <div className={bem(b, 'contact-row')}>
              <span className={bem(b, 'contact-icon')}><GlobeIcon /></span>
              <span className={bem(b, 'contact-text')}>{t('white_page.website')}</span>
            </div>
          </div>
        </section>

        {/* Social networks section */}
        <section className={bem(b, 'socials-section')}>
          <h2 className={bem(b, 'socials-title')}>{t('white_page.socials_title')}</h2>
          <div className={bem(b, 'socials-row')}>
            <button
              type="button"
              className={bem(b, 'social-btn')}
              onClick={() => {
                triggerHaptic('tap')
                window.open('https://t.me/boriga_baraka', '_blank', 'noopener,noreferrer')
              }}
            >
              <span className={bem(b, 'social-icon')} aria-label="Telegram">✈</span>
              <span>Telegram</span>
            </button>
            <button
              type="button"
              className={bem(b, 'social-btn')}
              onClick={() => {
                triggerHaptic('tap')
                window.open('https://instagram.com', '_blank', 'noopener,noreferrer')
              }}
            >
              <span className={bem(b, 'social-icon')} aria-label="Instagram">◎</span>
              <span>Instagram</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
