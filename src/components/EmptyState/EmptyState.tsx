import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { bem, cn } from '@/utils/cn'
import { GlassButton } from '@/components/GlassButton'
import './EmptyState.scss'

export interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  children?: ReactNode
}

const b = 'empty-state'

export function EmptyState({
  icon = '🔍',
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  const { t } = useTranslation('common')

  return (
    <div className={cn(b, className)} role="status">
      <span className={bem(b, 'icon')} aria-hidden="true">
        {icon}
      </span>
      <h3 className={bem(b, 'title')}>{title ?? t('empty.title')}</h3>
      {description && <p className={bem(b, 'description')}>{description}</p>}
      {children}
      {action && (
        <GlassButton variant="secondary" size="md" onClick={action.onClick}>
          {action.label}
        </GlassButton>
      )}
    </div>
  )
}
