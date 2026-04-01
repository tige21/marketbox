import { bem, cn } from '@/utils/cn'
import './Skeleton.scss'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  variant?: 'text' | 'rect' | 'circle' | 'card'
}

const b = 'skeleton'

export function Skeleton({
  width,
  height,
  borderRadius,
  className,
  variant = 'rect',
}: SkeletonProps) {
  return (
    <div
      className={cn(bem(b, undefined, { [`variant-${variant}`]: true }), className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius:
          typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
      }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton variant="rect" height={160} className="skeleton-card__image" />
      <div className="skeleton-card__body">
        <Skeleton variant="text" height={16} width="80%" />
        <Skeleton variant="text" height={12} width="60%" />
      </div>
    </div>
  )
}
