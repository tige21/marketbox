import { type ReactNode } from 'react'
import { bem, cn } from '@/utils/cn'
import './GlassCard.scss'

export interface GlassCardProps {
  children: ReactNode
  className?: string
  elevated?: boolean
  onClick?: () => void
  as?: 'div' | 'article' | 'section'
}

const b = 'glass-card'

export function GlassCard({
  children,
  className,
  elevated = false,
  onClick,
  as: Tag = 'div',
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        bem(b, undefined, { elevated, interactive: !!onClick }),
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {children}
    </Tag>
  )
}
