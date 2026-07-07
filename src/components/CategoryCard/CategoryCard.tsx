import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  /** When true the card is a non-interactive "coming soon" placeholder:
   * dimmed art, lock overlay, and tapping does NOT navigate. */
  locked?: boolean
  titleSize?: CategoryCardTitleSize
  className?: string
}

const b = 'category-card'

function LockGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" fill="currentColor" />
      <path
        d="M8 10.5V7.5a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Memoised: the home category list re-renders on lang/query changes but the
// per-card props (all primitives) stay stable, so cards skip re-render.
export const CategoryCard = memo(function CategoryCard({
  id: _id,
  title,
  description,
  imageUrl,
  route,
  isPremium,
  locked,
  titleSize = 'lg',
  className,
}: CategoryCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('home')

  const go = () => {
    if (locked) return
    triggerHaptic('tap')
    navigate(route)
  }

  return (
    <article
      className={cn(
        bem(b, undefined, { premium: !!isPremium, locked: !!locked }),
        className,
      )}
      onClick={go}
      role="button"
      tabIndex={0}
      aria-disabled={locked || undefined}
      onKeyDown={(e) => { if (e.key === 'Enter') go() }}
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
        {!locked && (
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
        )}
      </div>

      {locked && (
        <div className={bem(b, 'lock')} aria-hidden="true">
          <span className={bem(b, 'lock-badge')}>
            <LockGlyph />
          </span>
          <span className={bem(b, 'lock-text')}>
            {t('categories.coming_soon', { defaultValue: 'Скоро откроется' })}
          </span>
        </div>
      )}
    </article>
  )
})
