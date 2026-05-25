import { memo } from 'react'

interface Props {
  width?: number
  height?: number
  className?: string
  stroke?: string
}

export const ChevronRightIcon = memo(function ChevronRightIcon({
  width = 12,
  height = 14,
  className,
  stroke = '#FFFFFF',
}: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 12 14" fill="none" className={className} aria-hidden="true">
      <path d="M2 1.5L8.5 7L2 12.5" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
})
