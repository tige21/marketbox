export const SPRING_SNAPPY = { type: 'spring', stiffness: 400, damping: 30 } as const
export const SPRING_GENTLE = { type: 'spring', stiffness: 200, damping: 25 } as const
export const DURATION_FAST = 0.15
export const DURATION_NORMAL = 0.25

export const TAP_SCALE = { whileTap: { scale: 0.97 } } as const

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION_FAST },
} as const

export const SLIDE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: SPRING_SNAPPY,
} as const
