import { useParams } from 'react-router-dom'
import { GlassHeader } from '@/components/GlassHeader'
import { useCourseDetail } from './hooks/useCourses'
import { bem } from '@/utils/cn'
import './CourseDetailPage.scss'

const b = 'course-detail'

export function CourseDetailPage() {
  const { marketplace = '', id = '' } = useParams()
  const { data: course, isLoading } = useCourseDetail(id)

  const title = 'КУРС'

  return (
    <div className={b}>
      <GlassHeader showBack title={title} />
      <div className={bem(b, 'content')}>
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

        {!isLoading && course && (
          <div className={bem(b, 'info')}>
            <h1 className={bem(b, 'title')}>{course.title}</h1>
            {course.description && (
              <p className={bem(b, 'description')}>{course.description}</p>
            )}
            <div className={bem(b, 'meta')}>
              <span className={bem(b, 'marketplace')}>{marketplace.toUpperCase()}</span>
              <span className={bem(b, 'duration')}>{course.duration} ч.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
