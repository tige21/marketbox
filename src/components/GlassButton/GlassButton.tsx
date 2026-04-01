import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { bem, cn } from '@/utils/cn'
import './GlassButton.scss'

export type GlassButtonVariant = 'primary' | 'secondary' | 'ghost' | 'premium'
export type GlassButtonSize = 'sm' | 'md' | 'lg'

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: GlassButtonVariant
  size?: GlassButtonSize
  fullWidth?: boolean
  loading?: boolean
}

const b = 'glass-btn'

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...rest
}: GlassButtonProps) {
  return (
    <button
      className={cn(
        bem(b, undefined, {
          [`variant-${variant}`]: true,
          [`size-${size}`]: true,
          'full-width': fullWidth,
          loading,
        }),
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <span className={bem(b, 'spinner')} aria-hidden="true" />
      ) : null}
      <span className={bem(b, 'content', { hidden: loading })}>
        {children}
      </span>
    </button>
  )
}
