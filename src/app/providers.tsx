import { type ReactNode, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/utils/i18n'
import { registerUnauthorizedHandler } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: (failureCount, error) => {
        const axiosError = error as { response?: { status?: number } }
        const status = axiosError?.response?.status
        if (status === 401 || status === 403) return false
        return failureCount < 2
      },
      throwOnError: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})

// Register 401 handler — runs once at module level
registerUnauthorizedHandler(() => {
  useAuthStore.getState().clear()
})

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </QueryClientProvider>
    </I18nextProvider>
  )
}
