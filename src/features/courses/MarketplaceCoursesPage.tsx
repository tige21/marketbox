import { useParams, useNavigate } from 'react-router-dom'
import { GlassHeader } from '@/components/GlassHeader'
import { useCourses } from './hooks/useCourses'
import { bem, cn } from '@/utils/cn'
import type { CourseMarketplace } from '@/api/types'
import './MarketplaceCoursesPage.scss'

const b = 'marketplace-courses'

const MARKETPLACE_LABELS: Record<string, string> = {
  ozon: 'OZON',
  wildberries: 'WILDBERRIES',
  uzum: 'UZUM MARKET',
  dropshipping: 'DROPSHIPPING',
  china: 'БИЗНЕС С КИТАЕМ',
}

const KNOWN_MARKETPLACES: CourseMarketplace[] = ['ozon', 'wildberries', 'uzum']

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.12083 20.84 4.61Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}


export function MarketplaceCoursesPage() {
  const { marketplace = '' } = useParams()
  const navigate = useNavigate()

  const isKnownMarketplace = KNOWN_MARKETPLACES.includes(marketplace as CourseMarketplace)
  const apiMarketplace = isKnownMarketplace ? (marketplace as CourseMarketplace) : undefined

  const { data: courses, isLoading } = useCourses(apiMarketplace)

  const title = MARKETPLACE_LABELS[marketplace] ?? marketplace.toUpperCase()

  const handleLessonClick = (id: string) => {
    navigate(`/courses/${marketplace}/${id}`)
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={title} />
      <div className={bem(b, 'content')}>
        {isLoading && (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={bem(b, 'lesson-wrapper')}>
              <div className={cn(bem(b, 'card'), bem(b, 'card') + '--skeleton')} />
            </div>
          ))
        )}

        {!isLoading && (!courses || courses.length === 0) && (
          <div className={bem(b, 'empty')}>
            <p>Курсы скоро появятся</p>
          </div>
        )}

        {!isLoading && courses?.map((course, index) => {
          const isLocked = course.isPremium && !course.isEnrolled

          return (
            <div key={course.id} className={bem(b, 'lesson-wrapper')}>
              <button
                className={bem(b, 'card')}
                onClick={() => handleLessonClick(course.id)}
                aria-label={`Урок ${index + 1}: ${course.title}`}
              >
                <div className={bem(b, 'card-top')}>
                  <div className={bem(b, 'lesson-info')}>
                    <span className={bem(b, 'lesson-number')}>Урок {index + 1}</span>
                    <h3 className={bem(b, 'lesson-title')}>{course.title}</h3>
                  </div>
                  <div className={bem(b, 'card-actions')}>
                    <div
                      className={bem(b, 'heart-btn')}
                      role="button"
                      tabIndex={0}
                      onClick={e => { e.stopPropagation() }}
                      onKeyDown={e => { if (e.key === 'Enter') e.stopPropagation() }}
                      aria-label="В избранное"
                    >
                      <HeartIcon />
                    </div>
                    <div className={bem(b, 'avatar')} aria-hidden="true">
                      {course.authorAvatar
                        ? <img src={course.authorAvatar} alt={course.authorName} loading="lazy" decoding="async" />
                        : <span>{course.authorName?.charAt(0) ?? 'A'}</span>
                      }
                    </div>
                  </div>
                </div>

                <div className={bem(b, 'thumbnail-wrap')}>
                  {course.imageUrl
                    ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className={bem(b, 'thumbnail')}
                        loading="lazy"
                        decoding="async"
                      />
                    )
                    : <div className={bem(b, 'thumbnail-placeholder')} aria-hidden="true" />
                  }

                  {isLocked && (
                    <div className={bem(b, 'locked-overlay')}>
                      <span className={bem(b, 'locked-text')}>ДОСТУП ОТКРОЕТСЯ</span>
                      <span className={bem(b, 'locked-date')}>01.04.2026</span>
                    </div>
                  )}
                </div>
              </button>

              <div className={bem(b, 'materials')}>
                <div className={bem(b, 'materials-bar')}>
                  <img src="/images/courses/materials-icon.svg" alt="" aria-hidden="true" className={bem(b, 'materials-icon')} />
                  <span>Материалы к уроку</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
