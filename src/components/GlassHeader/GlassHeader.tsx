import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { bem, cn } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './GlassHeader.scss'

export interface GlassHeaderProps {
  title: string
  showBack?: boolean
  left?: ReactNode
  right?: ReactNode
  className?: string
  /** 'large' (default) = 30px uppercase; 'medium' = 22px mixed-case; 'bold' = 22px uppercase bold */
  size?: 'large' | 'medium' | 'bold'
}

const b = 'glass-header'

export function GlassHeader({ title, showBack, left, right, className, size = 'large' }: GlassHeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    triggerHaptic('tap')
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const leftContent = left ?? (showBack ? (
    <button
      type="button"
      className={bem(b, 'back')}
      onClick={handleBack}
      aria-label="Назад"
    >
      <img src="/app/images/profile/back-btn.svg" alt="" aria-hidden="true" />
    </button>
  ) : null)

  return (
    <header className={cn(b, className)}>
      <div className={bem(b, 'inner')}>
        <div className={bem(b, 'left')}>{leftContent}</div>
        <div className={bem(b, 'center')}>
          <h1
            className={cn(
              bem(b, 'title'),
              size === 'medium' && `${bem(b, 'title')}--medium`,
              size === 'bold' && `${bem(b, 'title')}--bold`,
            )}
          >
            {title}
          </h1>
        </div>
        <div className={bem(b, 'right')}>{right}</div>
      </div>
    </header>
  )
}
