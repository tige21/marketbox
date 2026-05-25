import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { bem, cn } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { BackButton } from '@/components/BackButton'
import { Skeleton, BackendImage } from '@/components'
import { EmptyState } from '@/components/EmptyState'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { useCourses } from './hooks'
import './CoursesPage.scss'

const b = 'courses-catalog'

function MessageIcon() {
  return (
    <svg width="28" height="21" viewBox="0 0 28 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M25 13C25 13.53 24.79 14.04 24.41 14.41C24.04 14.79 23.53 15 23 15H7L3 19V3C3 2.47 3.21 1.96 3.59 1.59C3.96 1.21 4.47 1 5 1H23C23.53 1 24.04 1.21 24.41 1.59C24.79 1.96 25 2.47 25 3V13Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CoursesCatalog() {
  const navigate = useNavigate()
  const { t } = useTranslation(['courses', 'common'])
  const lang = useLang()
  const { data: courses = [], isLoading, error } = useCourses()

  const handleTileClick = (id: number) => {
    triggerHaptic('tap')
    navigate(`/courses/${id}`)
  }

  const handleChatsClick = () => {
    triggerHaptic('tap')
    navigate('/courses/chats')
  }

  return (
    <div className={b}>
      <BackButton block={b} to="/" />

      <h1 className={bem(b, 'title')}>{t('title_uppercase')}</h1>

      <div className={bem(b, 'content')}>
        {isLoading ? (
          <div className={bem(b, 'grid')}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rect" height={150} borderRadius={20} />
            ))}
          </div>
        ) : error ? (
          <EmptyState icon="📚" title={t('common:error.generic')} />
        ) : courses.length === 0 ? (
          <EmptyState icon="📚" title={t('common:empty.title')} />
        ) : (
          <div className={bem(b, 'grid')}>
            {courses.map((course) => {
              const label = pickLocaleStr(course.title, lang)
              const image = pickLocale(course.image, lang)
              // The "Бизнес с Китаем" cover already has the section title
              // baked into its bottom — overlaying our own label on top
              // doubles the text. Until the asset is re-exported, shift
              // the image up so our label sits on a clean area.
              const isChina = /кита|xitoy|china/i.test(label)
              const imageClass = cn(
                bem(b, 'tile-image'),
                isChina && bem(b, 'tile-image', { 'shift-up': true }),
              )
              // The China cover artwork has a white background. When we
              // translate it up, the dark default tile bg leaks through
              // at the bottom (and any sub-pixel rounding at the top).
              // Force the tile bg to white for this card so seams blend.
              const tileClass = cn(
                bem(b, 'tile'),
                isChina && bem(b, 'tile', { 'white-bg': true }),
              )
              return (
                <button
                  key={course.id}
                  type="button"
                  className={tileClass}
                  onClick={() => handleTileClick(course.id)}
                  aria-label={label}
                >
                  {image ? (
                    <BackendImage
                      src={image}
                      alt=""
                      className={imageClass}
                    />
                  ) : (
                    <div className={imageClass} aria-hidden="true" />
                  )}
                  <span className={bem(b, 'tile-label')}>{label}</span>
                </button>
              )
            })}
          </div>
        )}

        <button type="button" className={bem(b, 'chats-btn')} onClick={handleChatsClick}>
          <MessageIcon />
          <span>{t('chats_title')}</span>
        </button>
      </div>
    </div>
  )
}
