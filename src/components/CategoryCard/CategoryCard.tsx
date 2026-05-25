import { useNavigate } from 'react-router-dom'
import { bem, cn } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './CategoryCard.scss'

export type CategoryCardTitleSize = 'lg' | 'md' | 'sm'

export interface CategoryCardProps {
  id: string
  title: string
  description?: string
  imageUrl: string
  route: string
  isPremium?: boolean
  titleSize?: CategoryCardTitleSize
  className?: string
}

const b = 'category-card'

export function CategoryCard({
  id: _id,
  title,
  description,
  imageUrl,
  route,
  isPremium,
  titleSize = 'lg',
  className,
}: CategoryCardProps) {
  const navigate = useNavigate()

  return (
    <article
      className={cn(
        bem(b, undefined, { premium: !!isPremium }),
        className,
      )}
      onClick={() => { triggerHaptic('tap'); navigate(route) }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') { triggerHaptic('tap'); navigate(route) } }}
      aria-label={title}
    >
      <div className={bem(b, 'image-wrap')}>
        <img
          src={imageUrl}
          alt=""
          className={bem(b, 'image')}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={bem(b, 'glass-bar')}>
        <span
          className={cn(
            bem(b, 'title'),
            bem(b, 'title', { [`size-${titleSize}`]: true }),
          )}
        >
          {title}
        </span>
        {description && (
          <p className={bem(b, 'description')}>{description}</p>
        )}
        <span className={bem(b, 'chevron')} aria-hidden="true">
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path
              d="M1.5 1.5L6.5 6.5L1.5 11.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </article>
  )
}
