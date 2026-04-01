import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { favoritesApi } from '@/api/endpoints'
import { triggerHaptic } from '@/utils'
import type { FavoriteItem } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { bem } from '@/utils/cn'
import './FavoritesPage.scss'

const b = 'favorites-page'

function HeartIcon() {
  return (
    <svg width="18" height="17" viewBox="0 0 24 22" fill="none">
      <path d="M20.84 3.61C20.3292 3.099 19.7228 2.694 19.0554 2.417C18.3879 2.141 17.6725 1.998 16.95 1.998C16.2275 1.998 15.5121 2.141 14.8446 2.417C14.1772 2.694 13.5708 3.099 13.06 3.61L12 4.67L10.94 3.61C9.9083 2.578 8.50903 1.999 7.05 1.999C5.59096 1.999 4.19169 2.578 3.16 3.61C2.1283 4.642 1.54871 6.041 1.54871 7.5C1.54871 8.959 2.1283 10.358 3.16 11.39L12 20.23L20.84 11.39C21.351 10.879 21.7563 10.273 22.0329 9.605C22.3095 8.938 22.4518 8.223 22.4518 7.5C22.4518 6.778 22.3095 6.062 22.0329 5.395C21.7563 4.727 21.351 4.121 20.84 3.61Z" fill="white" />
    </svg>
  )
}

interface FavoriteCardProps {
  item: FavoriteItem
  onRemove: (id: string) => void
  isRemoving: boolean
}

function FavoriteCard({ item, onRemove, isRemoving }: FavoriteCardProps) {
  const { t } = useTranslation('favorites')

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHaptic('tap')
    onRemove(item.id)
  }

  return (
    <motion.div
      className={bem(b, 'card-wrapper')}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isRemoving ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.22 }}
    >
      <div className={bem(b, 'card')}>
        <div className={bem(b, 'card-top')}>
          <h3 className={bem(b, 'card-title')}>{item.title}</h3>
          <button
            type="button"
            className={bem(b, 'card-heart')}
            onClick={handleHeartClick}
            disabled={isRemoving}
            aria-label={t('remove_aria')}
          >
            <HeartIcon />
          </button>
        </div>
        <div className={bem(b, 'card-thumbnail-wrap')}>
          <img
            src={item.imageUrl}
            alt=""
            className={bem(b, 'card-thumbnail')}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <div className={bem(b, 'card-materials')}>
        <div className={bem(b, 'card-materials-bar')}>
          <img src="/images/courses/materials-icon.svg" alt="" aria-hidden="true" className={bem(b, 'card-materials-icon')} />
          <span>{t('materials')}</span>
        </div>
      </div>
    </motion.div>
  )
}

function CardSkeleton() {
  return (
    <div className={bem(b, 'card-wrapper')}>
      <div className={bem(b, 'card')} style={{ opacity: 0.3 }}>
        <div className={bem(b, 'card-top')}>
          <Skeleton variant="text" height={42} width="50%" />
          <Skeleton variant="circle" width={42} height={42} />
        </div>
        <Skeleton variant="rect" height={189} borderRadius={10} />
      </div>
      <div className={bem(b, 'card-materials')}>
        <div className={bem(b, 'card-materials-bar')}>
          <Skeleton variant="text" height={12} width={120} />
        </div>
      </div>
    </div>
  )
}

export function FavoritesPage() {
  const { t } = useTranslation('favorites')
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getAll().then((r) => r.data.data),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => favoritesApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const previous = queryClient.getQueryData<FavoriteItem[]>(['favorites'])
      queryClient.setQueryData<FavoriteItem[]>(['favorites'], (old) =>
        old ? old.filter((item) => item.id !== id) : []
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const items = data ?? []

  return (
    <div className={b}>
      <h1 className={bem(b, 'title')}>{t('title')}</h1>

      <div className={bem(b, 'content')}>
        {isLoading && Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}

        {isError && !isLoading && (
          <EmptyState icon="⚠️" title={t('error')} className={bem(b, 'empty')} />
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            icon="🤍"
            title={t('empty_title')}
            description={t('empty_description')}
            className={bem(b, 'empty')}
          />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <FavoriteCard
                key={item.id}
                item={item}
                onRemove={(id) => removeMutation.mutate(id)}
                isRemoving={removeMutation.isPending && removeMutation.variables === item.id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
