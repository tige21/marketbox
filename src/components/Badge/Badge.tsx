import { type ReactNode } from 'react'
import { bem, cn } from '@/utils/cn'
import './Badge.scss'

export type BadgeVariant = 'default' | 'premium' | 'success' | 'error' | 'warning' | 'accent'

export interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const b = 'badge'

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(bem(b, undefined, { [`variant-${variant}`]: true }), className)}>
      {children}
    </span>
  )
}
