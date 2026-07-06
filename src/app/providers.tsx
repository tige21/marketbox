import { type ReactNode, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/utils/i18n'
import { registerUnauthorizedHandler } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'
import { VERSION } from '@/version'

// TEMPORARY: kill all data caching so every screen pulls fresh from the API
// each time (no stale window, no localStorage persistence, refetch on mount +
// focus). Flip back to `false` to restore the normal cache behaviour below —
// this is the single switch, nothing else needs editing.
const DISABLE_CACHE = true

const FIVE_MINUTES = 5 * 60 * 1000
const ONE_HOUR = 60 * 60 * 1000
const ONE_DAY = 24 * ONE_HOUR

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sensible default for user-bound data (profile, favorites, withdrawals).
      // Catalogue queries override this via setQueryDefaults below.
      staleTime: DISABLE_CACHE ? 0 : ONE_HOUR,
      gcTime: 7 * ONE_DAY,
      // While caching is off: refetch on every mount and on window focus so
      // the user never looks at a stale screen.
      refetchOnMount: DISABLE_CACHE ? 'always' : true,
      refetchOnWindowFocus: DISABLE_CACHE ? true : false,
      retry: (failureCount, error) => {
        const axiosError = error as { response?: { status?: number } }
        const status = axiosError?.response?.status
        if (status === 401 || status === 403) return false
        return failureCount < 2
      },
      throwOnError: true,
      refetchOnReconnect: true,
    },
  },
})

// Catalogue/content queries. The customer edits these from the admin panel
// (new courses, factories, guides) and expects them live within minutes —
// so the stale window is short (5m). Persistence still serves cached content
// instantly on open; the short staleTime just means a background refresh
// fires on the next mount/refocus once the window lapses. Pull-to-refresh
// (AppLayout) is the manual escape hatch for "I added it just now".
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
  queryClient.setQueryDefaults([prefix], {
    staleTime: DISABLE_CACHE ? 0 : FIVE_MINUTES,
    // Catalogue pages all render their own inline error/empty state
    // (EmptyState with a retry). The global `throwOnError: true` was
    // hijacking that — a single slow/timed-out fetch (e.g. a 15s timeout
    // on /fabrics/../companies) threw past the component into the
    // app-level ErrorBoundary, blanking the whole section. Keep the error
    // local so the page shows "try again" instead of crashing.
    throwOnError: false,
    // One retry is enough for a transient blip; two retries on a 15s
    // timeout meant ~45s of skeletons before the user saw anything.
    retry: 1,
  })
}

// FX rates do change daily — short window so the user sees fresh values
// when they actually need them.
queryClient.setQueryDefaults(['exchange'], { staleTime: DISABLE_CACHE ? 0 : 30 * 60 * 1000 })

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
  // Cache disabled → plain provider, no localStorage hydration, so nothing
  // stale is ever painted before the fresh fetch lands.
  if (DISABLE_CACHE) {
    return (
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>{children}</Suspense>
        </QueryClientProvider>
      </I18nextProvider>
    )
  }

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
            // Don't persist auth-sensitive or per-user premium queries; the
            // auth store owns the session, and subscription-gifts is fetched
            // fresh per session (persisting it also caused a noisy
            // "dehydrated as pending ended up rejecting" warning on 401).
            shouldDehydrateQuery: (query) => {
              const key = query.queryKey[0]
              if (typeof key !== 'string') return true
              return (
                !key.startsWith('auth') &&
                !key.startsWith('user') &&
                key !== 'subscription-gifts'
              )
            },
          },
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </PersistQueryClientProvider>
    </I18nextProvider>
  )
}
