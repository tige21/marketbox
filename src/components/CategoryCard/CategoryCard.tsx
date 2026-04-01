import { useNavigate } from 'react-router-dom'
import { bem, cn } from '@/utils/cn'
import './CategoryCard.scss'

export interface CategoryCardProps {
  id: string
  title: string
  description?: string
  imageUrl: string
  route: string
  isPremium?: boolean
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
  className,
}: CategoryCardProps) {
  const navigate = useNavigate()

  return (
    <article
      className={cn(bem(b, undefined, { premium: !!isPremium }), className)}
      onClick={() => navigate(route)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(route)}
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
        <span className={bem(b, 'title')}>{title}</span>
        {description && (
          <p className={bem(b, 'description')}>{description}</p>
        )}
        <span className={bem(b, 'chevron')} aria-hidden="true">›</span>
      </div>
    </article>
  )
}
