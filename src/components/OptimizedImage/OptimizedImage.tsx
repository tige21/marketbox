import { useState } from 'react'
import { bem, cn } from '@/utils/cn'
import './OptimizedImage.scss'

export interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  width?: number
  height?: number
  objectFit?: 'cover' | 'contain' | 'fill'
}

const b = 'opt-image'

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23222' width='100' height='100'/%3E%3Ctext fill='%23666' x='50' y='55' text-anchor='middle' font-size='30'%3E%F0%9F%93%B7%3C/text%3E%3C/svg%3E"

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = FALLBACK,
  width,
  height,
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={cn(bem(b, undefined, { loaded, error }), className)}>
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={bem(b, 'img')}
        style={{ objectFit }}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && <div className={bem(b, 'placeholder')} aria-hidden="true" />}
    </div>
  )
}
