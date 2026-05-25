import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { triggerHaptic } from '@/utils'
import { bem } from '@/utils/cn'

interface Props {
  /** BEM block — controls class name (e.g. 'cargo-main' produces 'cargo-main__back') */
  block: string
  /** Where to navigate on back. If omitted, uses browser history.back */
  to?: string | number
  ariaLabel?: string
}

export const BackButton = memo(function BackButton({ block, to, ariaLabel = 'Назад' }: Props) {
  const navigate = useNavigate()

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    triggerHaptic('tap')
    if (typeof to === 'string') navigate(to)
    else if (typeof to === 'number') navigate(to)
    else navigate(-1)
  }, [navigate, to])

  return (
    <a
      className={bem(block, 'back')}
      href="#"
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      <img src="/app/images/profile/back-btn.svg" alt="" aria-hidden="true" />
    </a>
  )
})
