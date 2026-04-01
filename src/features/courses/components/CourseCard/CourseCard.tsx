import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassCard } from '@/components/GlassCard'
import { Badge } from '@/components/Badge'
import { bem } from '@/utils/cn'
import type { Course } from '@/api/types'
import './CourseCard.scss'

interface CourseCardProps {
  course: Course
}

const b = 'course-card'

export function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('courses')

  return (
    <GlassCard
      as="article"
      className={b}
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className={bem(b, 'image-wrap')}>
        <img
          src={course.imageUrl}
          alt={course.title}
          className={bem(b, 'image')}
          loading="lazy"
          decoding="async"
        />
        {course.isPremium && (
          <Badge variant="premium" className={bem(b, 'premium-badge')}>
            Premium
          </Badge>
        )}
      </div>
      <div className={bem(b, 'body')}>
        <div className={bem(b, 'badges')}>
          <Badge variant="accent">{course.marketplace.toUpperCase()}</Badge>
          <Badge variant="default">{t(`level.${course.level}`)}</Badge>
        </div>
        <h3 className={bem(b, 'title')}>{course.title}</h3>
        <div className={bem(b, 'meta')}>
          <span className={bem(b, 'meta-item')}>⭐ {course.rating}</span>
          <span className={bem(b, 'meta-item')}>{course.lessonsCount} {t('lessons')}</span>
          <span className={bem(b, 'meta-item')}>{course.duration} {t('hours')}</span>
        </div>
        <div className={bem(b, 'footer')}>
          <span className={bem(b, 'price')}>
            {course.price === 0 ? t('price_free') : `${course.price.toLocaleString()} ${course.currency}`}
          </span>
          {course.isEnrolled && (
            <Badge variant="success">{t('enrolled')}</Badge>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
