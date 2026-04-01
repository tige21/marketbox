import { triggerHaptic } from '@/utils/telegram'

export function useHaptic() {
  return {
    tap: () => triggerHaptic('tap'),
    success: () => triggerHaptic('success'),
    error: () => triggerHaptic('error'),
    select: () => triggerHaptic('select'),
  }
}
