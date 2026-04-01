import { useSignal, initDataUser } from '@telegram-apps/sdk-react'

export function useTelegramUser() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const user = useSignal(initDataUser)
    return user ?? null
  } catch {
    return null
  }
}
