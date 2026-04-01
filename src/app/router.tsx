import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppLayout } from './AppLayout'

// Tab pages
const HomePage = lazy(() => import('@/features/home').then(m => ({ default: m.HomePage })))
const FavoritesPage = lazy(() => import('@/features/favorites').then(m => ({ default: m.FavoritesPage })))
const ProfilePage = lazy(() => import('@/features/profile').then(m => ({ default: m.ProfilePage })))
const MoneyPage = lazy(() => import('@/features/money').then(m => ({ default: m.MoneyPage })))

// Feature pages
const CoursesPage = lazy(() => import('@/features/courses').then(m => ({ default: m.CoursesPage })))
const CargoPage = lazy(() => import('@/features/cargo').then(m => ({ default: m.CargoPage })))
const FactoriesPage = lazy(() => import('@/features/factories').then(m => ({ default: m.FactoriesPage })))
const WholesalePage = lazy(() => import('@/features/wholesale').then(m => ({ default: m.WholesalePage })))
const ChinaGuideRouter = lazy(() => import('@/features/chinaGuide').then(m => ({ default: m.ChinaGuideRouter })))
const JobsPage = lazy(() => import('@/features/jobs').then(m => ({ default: m.JobsPage })))
const DesignServicesPage = lazy(() => import('@/features/designServices').then(m => ({ default: m.DesignServicesPage })))
const DocumentsPage = lazy(() => import('@/features/documents').then(m => ({ default: m.DocumentsPage })))
const ExchangePage = lazy(() => import('@/features/exchange').then(m => ({ default: m.ExchangePage })))
const EventsPage = lazy(() => import('@/features/events').then(m => ({ default: m.EventsPage })))
const NewsPage = lazy(() => import('@/features/news').then(m => ({ default: m.NewsPage })))

function PageFallback() {
  return (
    <div style={{
      minHeight: '50vh',
      margin: '16px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '20px',
    }} />
  )
}

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
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
        <Route path="money" element={<Lazy><MoneyPage /></Lazy>} />
        {/* Feature routes */}
        <Route path="courses/*" element={<Lazy><CoursesPage /></Lazy>} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
