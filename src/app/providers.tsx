import { type ReactNode, Suspense } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/utils/i18n'
import { registerUnauthorizedHandler } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { VERSION } from '@/version'

const ONE_HOUR = 60 * 60 * 1000
const ONE_DAY = 24 * ONE_HOUR

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sensible default for user-bound data (profile, favorites, withdrawals).
      // Catalogue queries override this via setQueryDefaults below.
      staleTime: ONE_HOUR,
      gcTime: 7 * ONE_DAY,
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

// Catalogue/content queries — the backend changes them rarely (curated
// courses, factories, guides). With persistence on, a returning user sees
// content immediately from localStorage and the background refresh is
// almost always a no-op.
const STATIC_QUERY_PREFIXES = [
  'categories',
  'courses',
  'modules',
  'lesson',
  'lessons',
  'cargo',
  'cargo-logistic',
  'cargo-logistics',
  'factories',
  'fabrics',
  'china-guide',
  'guids',
  'translators',
  'design-services',
  'design-candidates',
  'articles',
] as const

for (const prefix of STATIC_QUERY_PREFIXES) {
  queryClient.setQueryDefaults([prefix], { staleTime: ONE_DAY })
}

// FX rates do change daily — short window so the user sees fresh values
// when they actually need them.
queryClient.setQueryDefaults(['exchange'], { staleTime: 30 * 60 * 1000 })

const persister = createSyncStoragePersister({
  storage: typeof window === 'undefined' ? undefined : window.localStorage,
  key: 'marketbox-rq-cache',
  throttleTime: 1000,
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
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 7 * ONE_DAY,
          // buster invalidates the entire persisted cache when the app
          // version changes, so a deploy never resurrects stale shapes.
          buster: VERSION,
          dehydrateOptions: {
            // Don't persist auth-sensitive queries; the auth store handles
            // its own session.
            shouldDehydrateQuery: (query) => {
              const key = query.queryKey[0]
              if (typeof key !== 'string') return true
              return !key.startsWith('auth') && !key.startsWith('user')
            },
          },
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </PersistQueryClientProvider>
    </I18nextProvider>
  )
}
