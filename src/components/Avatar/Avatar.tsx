import { useState } from 'react'
import { bem, cn } from '@/utils/cn'
import './Avatar.scss'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps {
  src?: string
  name?: string
  size?: AvatarSize
  className?: string
}

const b = 'avatar'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [error, setError] = useState(false)

  return (
    <div
      className={cn(bem(b, undefined, { [`size-${size}`]: true }), className)}
      aria-label={name}
    >
      {src && !error ? (
        <img
          src={src}
          alt={name ?? ''}
          className={bem(b, 'image')}
          loading="lazy"
          decoding="async"
          onError={() => setError(true)}
        />
      ) : (
        <span className={bem(b, 'initials')}>
          {name ? getInitials(name) : '?'}
        </span>
      )}
    </div>
  )
}
