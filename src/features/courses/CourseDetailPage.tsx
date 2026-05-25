import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { Skeleton } from '@/components'
import { pickLocaleStr, useLang } from '@/api/locale'
import { useCourseDetail } from './hooks/useCourses'
import { bem } from '@/utils/cn'
import './CourseDetailPage.scss'

const b = 'course-detail'

export function CourseDetailPage() {
  const { t } = useTranslation('courses')
  const lang = useLang()
  const { id = '' } = useParams()
  const { data: course, isLoading } = useCourseDetail(id)

  const title = course ? pickLocaleStr(course.title, lang) : t('course_title')
  const description = course ? pickLocaleStr(course.description, lang) : ''

  return (
    <div className={b}>
      <GlassHeader showBack title={title} />
      <div className={bem(b, 'content')}>
        {isLoading ? (
          <Skeleton variant="rect" width="100%" height={200} />
        ) : (
          <div className={bem(b, 'player')}>
            <div className={bem(b, 'player-inner')}>
              <div className={bem(b, 'play-icon')} aria-hidden="true">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="28" cy="28" r="28" fill="rgba(255,255,255,0.12)" />
                  <path d="M22 18L38 28L22 38V18Z" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className={bem(b, 'info')}>
            <Skeleton variant="rect" width="70%" height={28} />
            <Skeleton variant="rect" width="100%" height={60} />
          </div>
        ) : course && (
          <div className={bem(b, 'info')}>
            <h1 className={bem(b, 'title')}>{title}</h1>
            {description && (
              <p className={bem(b, 'description')}>{description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
