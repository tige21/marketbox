import { useTranslation } from 'react-i18next'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { Skeleton } from '@/components'
import { BackButton } from '@/components/BackButton'
import { ChevronRightIcon } from '@/components/Icons'
import { EmptyState } from '@/components/EmptyState'
import { pickLocaleStr, useLang } from '@/api/locale'
import { useCourses } from './hooks'
import './CoursesChatsPage.scss'

const b = 'courses-chats'

export function CoursesChatsPage() {
  const { t } = useTranslation(['courses', 'common'])
  const lang = useLang()
  const { data: courses = [], isLoading, error } = useCourses()

  const chats = courses.filter((c) => !!c.chat_url)

  const openChat = (url: string) => {
    triggerHaptic('tap')
    const tg = (window as unknown as {
      Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } }
    }).Telegram?.WebApp
    if (tg?.openTelegramLink) tg.openTelegramLink(url)
    else window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={b}>
      <BackButton block={b} to="/courses" />

      <h1 className={bem(b, 'title')}>{t('chats_title')}</h1>

      {error ? (
        <EmptyState icon="💬" title={t('common:error.generic')} />
      ) : isLoading ? (
        <ul className={bem(b, 'list')} role="list">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className={bem(b, 'item')}>
              <Skeleton variant="rect" height={49} borderRadius={20} width="100%" />
            </li>
          ))}
        </ul>
      ) : chats.length === 0 ? (
        <EmptyState icon="💬" title={t('common:empty.title')} />
      ) : (
        <ul className={bem(b, 'list')} role="list">
          {chats.map((course) => {
            const name = pickLocaleStr(course.title, lang)
            return (
              <li key={course.id} className={bem(b, 'item')}>
                <button
                  type="button"
                  className={bem(b, 'row')}
                  onClick={() => openChat(course.chat_url!)}
                  aria-label={name}
                >
                  <img
                    className={bem(b, 'row-icon')}
                    src="/app/images/cargo/chat-icon.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <span className={bem(b, 'row-name')}>{name}</span>
                  <span className={bem(b, 'row-chevron')} aria-hidden="true">
                    <ChevronRightIcon width={10} height={18} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
