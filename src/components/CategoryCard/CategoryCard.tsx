import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { bem, cn } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { BackendImage } from '@/components/BackendImage'
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

// Memoised: the home category list re-renders on lang/query changes but the
// per-card props (all primitives) stay stable, so cards skip re-render.
export const CategoryCard = memo(function CategoryCard({
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
        {/* BackendImage (not a raw <img>): rewrites the cdn.marketandbox.ru
            host to the same-origin domain and loads eagerly with a retry —
            the raw <img loading="lazy"> failed to show on iOS WKWebView and
            never applied the host rewrite, so category art stayed blank. */}
        <BackendImage
          src={imageUrl}
          alt=""
          className={bem(b, 'image')}
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
})
