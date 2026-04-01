import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { bem, cn } from '@/utils/cn'
import './GlassHeader.scss'

export interface GlassHeaderProps {
  title: string
  showBack?: boolean
  left?: ReactNode
  right?: ReactNode
  className?: string
  /** 'large' (default) = 30px uppercase; 'medium' = 18px mixed-case */
  size?: 'large' | 'medium'
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const b = 'glass-header'

export function GlassHeader({ title, showBack, left, right, className, size = 'large' }: GlassHeaderProps) {
  const navigate = useNavigate()

  const leftContent = left ?? (showBack ? (
    <button
      className={bem(b, 'back')}
      onClick={() => navigate(-1)}
      aria-label="Назад"
    >
      <ChevronLeftIcon />
    </button>
  ) : null)

  return (
    <header className={cn(b, className)}>
      <div className={bem(b, 'inner')}>
        <div className={bem(b, 'left')}>{leftContent}</div>
        <div className={bem(b, 'center')}>
          <h1 className={cn(bem(b, 'title'), size === 'medium' && bem(b, 'title') + '--medium')}>{title}</h1>
        </div>
        <div className={bem(b, 'right')}>{right}</div>
      </div>
    </header>
  )
}
