import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { bem } from '@/utils/cn'
import { BackButton } from '@/components/BackButton'
import { Skeleton, LessonCard, type LessonCardLesson } from '@/components'
import { EmptyState } from '@/components/EmptyState'
import { pickLocaleStr, useLang } from '@/api/locale'
import { triggerHaptic } from '@/utils'
import { useLessonFavorites } from '@/features/favorites/hooks/useLessonFavorites'
import { useModuleDetail, useModuleLessons } from './hooks'
import './MarketplaceCoursesPage.scss'

const b = 'marketplace-courses'

function LessonCardWithLike({
  lesson,
  number,
  onMaterialsClick,
}: {
  lesson: LessonCardLesson
  number: number
  onMaterialsClick: () => void
}) {
  const { isFavorite, toggle, pendingId } = useLessonFavorites()
  return (
    <LessonCard
      lesson={lesson}
      number={number}
      liked={isFavorite(lesson.id)}
      onLikeToggle={() => toggle(lesson)}
      disabled={pendingId === lesson.id}
      onMaterialsClick={onMaterialsClick}
    />
  )
}

// 3rd level of the new courses hierarchy: lessons inside a module.
// Path: `/courses/:marketplace/:moduleId`. Tapping a lesson's "Материалы"
// drills into LessonDetailPage one level deeper.
export function ModuleLessonsPage() {
  const { t } = useTranslation('courses')
  const lang = useLang()
  const navigate = useNavigate()
  const { marketplace = '', moduleId = '' } = useParams()
  const numericModuleId = Number(moduleId)
  const validModuleId =
    Number.isFinite(numericModuleId) && numericModuleId > 0 ? numericModuleId : undefined

  const { data: mod } = useModuleDetail(validModuleId)
  const { data: lessons = [], isLoading, error } = useModuleLessons(validModuleId)

  const title = mod ? pickLocaleStr(mod.title, lang) : ''

  function handleOpenLesson(lessonId: number | string) {
    triggerHaptic('tap')
    navigate(`/courses/${marketplace}/${moduleId}/${lessonId}`)
  }

  return (
    <div className={b}>
      <BackButton block={b} to={`/courses/${marketplace}`} />

      <h1 className={bem(b, 'title')}>{title}</h1>

      <div className={bem(b, 'content')}>
        {validModuleId == null ? (
          <div className={bem(b, 'empty')}>
            <p>{t('lessons_coming_soon')}</p>
          </div>
        ) : isLoading ? (
          <>
            <Skeleton variant="rect" height={342} borderRadius={20} />
            <Skeleton variant="rect" height={342} borderRadius={20} />
          </>
        ) : error ? (
          <EmptyState icon="📚" title={t('lessons_load_error')} />
        ) : lessons.length === 0 ? (
          <div className={bem(b, 'empty')}>
            <p>{t('lessons_coming_soon')}</p>
          </div>
        ) : (
          lessons.map((lesson, i) => (
            <LessonCardWithLike
              key={lesson.id}
              lesson={lesson}
              number={i + 1}
              onMaterialsClick={() => handleOpenLesson(lesson.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
