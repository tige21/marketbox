import { useTranslation } from 'react-i18next'
import { CategoryCard } from '@/components/CategoryCard'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCategories } from '../../hooks/useCategories'
import './CategoryList.scss'

const b = 'category-list'

export function CategoryList() {
  const { t } = useTranslation(['home', 'common'])
  const { data: categories, isLoading, error } = useCategories()

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title={t('common:error.generic')}
        description={t('home:categories.errorDescription')}
      />
    )
  }

  return (
    <section className={b} aria-label={t('home:categories.title')}>
      <div aria-live="polite" aria-busy={isLoading} className={`${b}__list`}>
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} variant="rect" height={171} borderRadius={20} />
            ))
          : categories?.map(cat => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                title={cat.title}
                description={cat.description}
                imageUrl={cat.imageUrl}
                route={cat.route}
                isPremium={cat.isPremium}
              />
            ))
        }
      </div>
    </section>
  )
}
