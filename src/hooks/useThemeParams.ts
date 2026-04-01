import { useSignal, isMiniAppDark, miniAppBackgroundColor } from '@telegram-apps/sdk-react'

export function useThemeParams() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isDark = useSignal(isMiniAppDark)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const backgroundColor = useSignal(miniAppBackgroundColor)
    return {
      isDark,
      backgroundColor,
    }
  } catch {
    return {
      isDark: true,
      backgroundColor: '#121212',
    }
  }
}
