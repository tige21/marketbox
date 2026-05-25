import { memo } from 'react'
import { Skeleton } from '@/components/Skeleton'

interface Props {
  count: number
  height: number
  width?: string | number
  borderRadius?: number
  variant?: 'rect' | 'text' | 'circle' | 'card'
}

export const SkeletonGrid = memo(function SkeletonGrid({
  count,
  height,
  width = '100%',
  borderRadius = 20,
  variant = 'rect',
}: Props) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          width={width}
          height={height}
          borderRadius={borderRadius}
        />
      ))}
    </>
  )
})
