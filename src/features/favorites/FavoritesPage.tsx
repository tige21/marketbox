import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { triggerHaptic } from '@/utils'
import type { BackendLesson } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { LessonCard } from '@/components/LessonCard'
import { bem } from '@/utils/cn'
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

export function FavoritesPage() {
  const { t } = useTranslation('favorites')
  const navigate = useNavigate()
  // Pull-to-refresh is now global (AppLayout) — it invalidates the whole
  // query cache, including these favorites, so no per-page handler here.
  const { lessons, isLoading, isError, toggle, pendingId } = useLessonFavorites()

  const handleOpenMaterials = (lesson: BackendLesson) => {
    // Direct lesson route — works for both cargo-sourced and
    // course-sourced favorites without needing the module hierarchy.
    navigate(`/lessons/${lesson.id}`)
  }

  return (
    <div className={b}>
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
  )
}
