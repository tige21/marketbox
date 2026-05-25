import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppLayout } from './AppLayout'

// After a deploy, the SPA still in memory may try to import a chunk whose
// hash no longer matches the new manifest — browsers throw "Importing a
// module script failed" / "Failed to fetch dynamically imported module".
// When that happens, force a single hard reload to fetch the fresh
// index.html. A session flag prevents reload loops if the failure is
// real (e.g. genuinely missing chunk).
const RELOAD_KEY = '__chunk_reload_at__'
function isChunkLoadError(err: unknown): boolean {
  if (!err) return false
  const msg = (err as Error).message ?? String(err)
  return /import.*module|Failed to fetch dynamically|ChunkLoadError|Loading chunk/i.test(msg)
}
function lazyWithReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await factory()
    } catch (err) {
      if (isChunkLoadError(err)) {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
        // If we already reloaded in the last 30s, assume the failure is real.
        if (Date.now() - last > 30_000) {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
          window.location.reload()
          // Render nothing while the reload is in flight.
          return { default: (() => null) as unknown as T }
        }
      }
      throw err
    }
  })
}

// Tab pages
const HomePage = lazyWithReload(() => import('@/features/home').then(m => ({ default: m.HomePage })))
const FavoritesPage = lazyWithReload(() => import('@/features/favorites').then(m => ({ default: m.FavoritesPage })))
const ProfilePage = lazyWithReload(() => import('@/features/profile').then(m => ({ default: m.ProfilePage })))
const MoneyPage = lazyWithReload(() => import('@/features/money').then(m => ({ default: m.MoneyPage })))
const MoneyWithdrawalPage = lazyWithReload(() => import('@/features/money').then(m => ({ default: m.MoneyWithdrawalPage })))

// Feature pages
const CoursesPage = lazyWithReload(() => import('@/features/courses').then(m => ({ default: m.CoursesPage })))
const CargoPage = lazyWithReload(() => import('@/features/cargo').then(m => ({ default: m.CargoPage })))
const FactoriesPage = lazyWithReload(() => import('@/features/factories').then(m => ({ default: m.FactoriesPage })))
const WholesalePage = lazyWithReload(() => import('@/features/wholesale').then(m => ({ default: m.WholesalePage })))
const ChinaGuideRouter = lazyWithReload(() => import('@/features/chinaGuide').then(m => ({ default: m.ChinaGuideRouter })))
const JobsPage = lazyWithReload(() => import('@/features/jobs').then(m => ({ default: m.JobsPage })))
const DesignServicesPage = lazyWithReload(() => import('@/features/designServices').then(m => ({ default: m.DesignServicesPage })))
const DocumentsPage = lazyWithReload(() => import('@/features/documents').then(m => ({ default: m.DocumentsPage })))
const ExchangePage = lazyWithReload(() => import('@/features/exchange').then(m => ({ default: m.ExchangePage })))
const EventsPage = lazyWithReload(() => import('@/features/events').then(m => ({ default: m.EventsPage })))
const NewsPage = lazyWithReload(() => import('@/features/news').then(m => ({ default: m.NewsPage })))
const LessonPreviewPage = lazyWithReload(() => import('@/features/courses').then(m => ({ default: m.LessonPreviewPage })))
const LessonDetailPage = lazyWithReload(() => import('@/features/courses').then(m => ({ default: m.LessonDetailPage })))
const ProfileFaqPage = lazyWithReload(() => import('@/features/profile').then(m => ({ default: m.ProfileFaqPage })))

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>{children}</Suspense>
    </ErrorBoundary>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Tab routes */}
        <Route index element={<Lazy><HomePage /></Lazy>} />
        <Route path="favorites" element={<Lazy><FavoritesPage /></Lazy>} />
        <Route path="profile/*" element={<Lazy><ProfilePage /></Lazy>} />
        <Route path="money/withdrawal" element={<Lazy><MoneyWithdrawalPage /></Lazy>} />
        <Route path="money/*" element={<Lazy><MoneyPage /></Lazy>} />
        {/* Feature routes */}
        <Route path="courses/*" element={<Lazy><CoursesPage /></Lazy>} />
        {/* Standalone lesson detail — used from cargo and favorites
            where lessons aren't nested inside a course/module hierarchy. */}
        <Route path="lessons/:id" element={<Lazy><LessonDetailPage /></Lazy>} />
        <Route path="cargo/*" element={<Lazy><CargoPage /></Lazy>} />
        <Route path="factories/*" element={<Lazy><FactoriesPage /></Lazy>} />
        <Route path="wholesale/*" element={<Lazy><WholesalePage /></Lazy>} />
        <Route path="china-guide/*" element={<Lazy><ChinaGuideRouter /></Lazy>} />
        <Route path="jobs/*" element={<Lazy><JobsPage /></Lazy>} />
        <Route path="design-services/*" element={<Lazy><DesignServicesPage /></Lazy>} />
        <Route path="documents/*" element={<Lazy><DocumentsPage /></Lazy>} />
        <Route path="exchange" element={<Lazy><ExchangePage /></Lazy>} />
        <Route path="events/*" element={<Lazy><EventsPage /></Lazy>} />
        <Route path="news/*" element={<Lazy><NewsPage /></Lazy>} />
        <Route path="preview/lesson" element={<Lazy><LessonPreviewPage /></Lazy>} />
        <Route path="preview/faq" element={<Lazy><ProfileFaqPage /></Lazy>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
