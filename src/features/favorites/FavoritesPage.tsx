import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { triggerHaptic } from '@/utils'
import type { BackendLesson } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { LessonCard } from '@/components/LessonCard'
import { bem, cn } from '@/utils/cn'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { useLessonFavorites } from './hooks/useLessonFavorites'
import './FavoritesPage.scss'

const b = 'favorites-page'

interface FavoriteCardProps {
  lesson: BackendLesson
  onRemove: (lesson: BackendLesson) => void
  onOpenMaterials: (lesson: BackendLesson) => void
  isRemoving: boolean
}

function FavoriteCard({ lesson, onRemove, onOpenMaterials, isRemoving }: FavoriteCardProps) {
  const handleRemove = () => {
    if (isRemoving) return
    triggerHaptic('tap')
    onRemove(lesson)
  }

  return (
    <LessonCard
      lesson={lesson}
      liked={true}
      onLikeToggle={handleRemove}
      onMaterialsClick={() => onOpenMaterials(lesson)}
      disabled={isRemoving}
      Container={({ className, children }) => (
        <motion.div
          className={className}
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: isRemoving ? 0.4 : 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
          transition={{ duration: 0.22 }}
        >
          {children}
        </motion.div>
      )}
    />
  )
}

function CardSkeleton() {
  return (
    <Skeleton variant="rect" height={342} borderRadius={20} />
  )
}

function PullSpinner({ progress, spinning }: { progress: number; spinning: boolean }) {
  // Discrete circle that fades in with the pull and rotates while
  // refreshing. The rotation amount during the pull (0 → 180°) gives
  // visible feedback that "you're getting closer to the trigger".
  return (
    <span
      className={cn(bem(b, 'pull-spinner'), spinning && bem(b, 'pull-spinner', { spinning: true }))}
      style={{
        opacity: progress,
        transform: spinning ? undefined : `rotate(${progress * 180}deg)`,
      }}
      aria-hidden="true"
    />
  )
}

export function FavoritesPage() {
  const { t } = useTranslation('favorites')
  const navigate = useNavigate()
  const { lessons, isLoading, isError, toggle, pendingId, refetch } = useLessonFavorites()

  // Pull-to-refresh: dampening 0.5 + threshold 80px means the user has
  // to drag ~160px deliberately. Routine scroll-to-top gestures don't
  // reach that distance, so this won't fire on accidental swipes.
  const { pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: () => refetch(),
    threshold: 80,
    dampening: 0.5,
    enabled: !isLoading,
  })

  const handleOpenMaterials = (lesson: BackendLesson) => {
    // Direct lesson route — works for both cargo-sourced and
    // course-sourced favorites without needing the module hierarchy.
    navigate(`/lessons/${lesson.id}`)
  }

  // While the user is actively pulling, kill the transition so the
  // content tracks the finger 1:1. On release the transition kicks in
  // and the snap-back / park-at-threshold animates smoothly.
  const isAnimating = pullDistance === 0 || isRefreshing

  return (
    <div className={b}>
      <div
        className={bem(b, 'pull-indicator')}
        style={{ height: pullDistance }}
        aria-hidden="true"
      >
        <PullSpinner progress={progress} spinning={isRefreshing} />
      </div>

      <div
        className={bem(b, 'inner')}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isAnimating ? 'transform 0.25s ease' : 'none',
        }}
      >
        <h1 className={bem(b, 'title')}>{t('title')}</h1>

        <div className={bem(b, 'content')}>
          {isLoading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

          {isError && !isLoading && (
            <EmptyState icon="⚠️" title={t('error')} className={bem(b, 'empty')} />
          )}

          {!isLoading && !isError && lessons.length === 0 && (
            <EmptyState
              icon="🤍"
              title={t('empty_title')}
              description={t('empty_description')}
              className={bem(b, 'empty')}
            />
          )}

          {!isLoading && !isError && lessons.length > 0 && (
            <AnimatePresence initial={false}>
              {lessons.map((lesson) => (
                <FavoriteCard
                  key={lesson.id}
                  lesson={lesson}
                  onRemove={toggle}
                  onOpenMaterials={handleOpenMaterials}
                  isRemoving={pendingId === lesson.id}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
