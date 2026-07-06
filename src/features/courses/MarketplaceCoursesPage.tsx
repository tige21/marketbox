import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { bem, cn } from '@/utils/cn'
import { BackButton } from '@/components/BackButton'
import { Skeleton, BackendImage } from '@/components'
import { EmptyState } from '@/components/EmptyState'
import { toast } from '@/components/Toast'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { triggerHaptic } from '@/utils'
import { useCourseDetail, useCourseModules } from './hooks'
import './MarketplaceCoursesPage.scss'

const b = 'marketplace-courses'

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor" />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

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

  // Render modules in the API order (= admin order). The backend `order`
  // field turned out unreliable (1 for every module), so sorting by it
  // scrambled the sequence vs. the admin panel — keep the server order.

  function handleOpenModule(moduleId: number | string, locked: boolean) {
    if (locked) {
      triggerHaptic('error')
      toast.warning(t('module_locked'))
      return
    }
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
          modules.map((mod, index) => {
            const moduleTitle = pickLocaleStr(mod.title, lang)
            const moduleImage = pickLocale(mod.image, lang)
            // Default to accessible when the flag is absent (old data).
            const locked = mod.is_accessible === false
            return (
              <button
                key={mod.id}
                type="button"
                className={cn(bem(b, 'module-tile'), locked && bem(b, 'module-tile', { locked: true }))}
                onClick={() => handleOpenModule(mod.id, locked)}
                aria-label={`${index + 1}. ${moduleTitle}`}
                aria-disabled={locked}
              >
                {moduleImage && (
                  <BackendImage
                    src={moduleImage}
                    alt=""
                    className={bem(b, 'module-image')}
                  />
                )}
                {/* Module ordinal — the tile art is a backend image with the
                    title baked in, so the number is an overlay badge. */}
                <span className={bem(b, 'module-number')} aria-hidden="true">
                  {index + 1}
                </span>
                {locked && (
                  <span className={bem(b, 'module-lock')} aria-hidden="true">
                    <LockIcon />
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
