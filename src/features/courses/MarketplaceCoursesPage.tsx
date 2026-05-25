import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { bem } from '@/utils/cn'
import { BackButton } from '@/components/BackButton'
import { Skeleton, BackendImage } from '@/components'
import { EmptyState } from '@/components/EmptyState'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { triggerHaptic } from '@/utils'
import { useCourseDetail, useCourseModules } from './hooks'
import './MarketplaceCoursesPage.scss'

const b = 'marketplace-courses'

// Backend (May 2026) introduced a Module layer between Course and Lesson:
// `/courses → /courses/{id}/modules → /modules/{id}/lessons`. This page
// now lists MODULES for the selected course; tapping a tile drills into
// the lessons of that module (handled by ModuleLessonsPage).
export function MarketplaceCoursesPage() {
  const { t } = useTranslation('courses')
  const lang = useLang()
  const navigate = useNavigate()
  const { marketplace = '' } = useParams()
  const courseId = Number(marketplace)
  const validId = Number.isFinite(courseId) && courseId > 0 ? courseId : undefined

  const { data: course } = useCourseDetail(validId)
  const { data: modules = [], isLoading, error } = useCourseModules(validId)

  const title = course ? pickLocaleStr(course.title, lang) : ''

  function handleOpenModule(moduleId: number | string) {
    triggerHaptic('tap')
    navigate(`/courses/${marketplace}/${moduleId}`)
  }

  return (
    <div className={b}>
      <BackButton block={b} to="/courses" />

      <h1 className={bem(b, 'title')}>{title}</h1>

      <div className={bem(b, 'content')}>
        {validId == null ? (
          <div className={bem(b, 'empty')}>
            <p>{t('lessons_coming_soon')}</p>
          </div>
        ) : isLoading ? (
          <>
            <Skeleton variant="rect" height={150} borderRadius={20} />
            <Skeleton variant="rect" height={150} borderRadius={20} />
          </>
        ) : error ? (
          <EmptyState icon="📚" title={t('lessons_load_error')} />
        ) : modules.length === 0 ? (
          <div className={bem(b, 'empty')}>
            <p>{t('lessons_coming_soon')}</p>
          </div>
        ) : (
          modules.map((mod) => {
            const moduleTitle = pickLocaleStr(mod.title, lang)
            const moduleImage = pickLocale(mod.image, lang)
            const moduleSubtitle = mod.preview_text ? pickLocaleStr(mod.preview_text, lang) : ''
            return (
              <button
                key={mod.id}
                type="button"
                className={bem(b, 'module-tile')}
                onClick={() => handleOpenModule(mod.id)}
                aria-label={moduleTitle}
              >
                {moduleImage && (
                  <BackendImage
                    src={moduleImage}
                    alt=""
                    className={bem(b, 'module-image')}
                    loading="lazy"
                  />
                )}
                <div className={bem(b, 'module-bar')}>
                  <span className={bem(b, 'module-title')}>{moduleTitle}</span>
                  {moduleSubtitle && (
                    <span className={bem(b, 'module-subtitle')}>{moduleSubtitle}</span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
