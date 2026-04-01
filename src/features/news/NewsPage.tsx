import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { EmptyState } from '@/components/EmptyState'
import { newsApi } from '@/api/endpoints'
import type { NewsArticle, NewsCategory } from '@/api/types'
import { bem } from '@/utils/cn'
import { useHaptic } from '@/hooks/useHaptic'
import './NewsPage.scss'

const b = 'news-page'

// ─── Helpers ────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// ─── News Card ───────────────────────────────────────────────

interface NewsCardProps {
  article: NewsArticle
  onClick: () => void
}

function NewsCard({ article, onClick }: NewsCardProps) {
  const { t, i18n } = useTranslation('news')
  const haptic = useHaptic()
  const isUz = i18n.language === 'uz'

  const title = isUz && article.titleUz ? article.titleUz : article.title
  const summary = isUz && article.summaryUz ? article.summaryUz : article.summary
  const categoryLabel = t(`category.${article.category as NewsCategory}`, {
    defaultValue: article.category,
  })

  const handleClick = () => {
    haptic.tap()
    onClick()
  }

  return (
    <article
      className={bem(b, 'card')}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={title}
    >
      <div className={bem(b, 'card-image-wrap')}>
        <img
          src={article.imageUrl}
          alt={title}
          className={bem(b, 'card-image')}
          loading="lazy"
          decoding="async"
        />
        <span className={bem(b, 'category-badge')}>{categoryLabel}</span>
      </div>

      <div className={bem(b, 'card-body')}>
        <h3 className={bem(b, 'card-title')}>{title}</h3>
        <p className={bem(b, 'card-summary')}>{summary}</p>

        <div className={bem(b, 'card-footer')}>
          <div className={bem(b, 'card-meta')}>
            <span className={bem(b, 'card-date')}>{formatDate(article.publishedAt)}</span>
            {article.viewsCount > 0 && (
              <span className={bem(b, 'card-views')}>
                👁 {article.viewsCount.toLocaleString('ru-RU')} {t('views')}
              </span>
            )}
          </div>
          <button type="button" className={bem(b, 'read-more-btn')}>
            {t('read_more')}
          </button>
        </div>
      </div>
    </article>
  )
}

// ─── Skeleton ────────────────────────────────────────────────

function NewsCardSkeleton() {
  return (
    <div className={bem(b, 'card-skeleton')}>
      <div className="skeleton skeleton--variant-rect" style={{ height: 200, borderRadius: 0 }} />
      <div className={bem(b, 'skeleton-body')}>
        <div className="skeleton skeleton--variant-rect" style={{ width: 80, height: 22, borderRadius: 11 }} />
        <div className="skeleton skeleton--variant-text" style={{ height: 18, width: '85%' }} />
        <div className="skeleton skeleton--variant-text" style={{ height: 14, width: '70%' }} />
        <div className="skeleton skeleton--variant-text" style={{ height: 14, width: '55%' }} />
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────

export function NewsPage() {
  const { t } = useTranslation('news')

  const { data, isLoading, error } = useQuery({
    queryKey: ['news', 'list'],
    queryFn: () => newsApi.getList().then((res) => res.data),
    staleTime: 3 * 60 * 1000,
  })

  const articles: NewsArticle[] = data?.data ?? []

  const handleArticleClick = (id: string) => {
    // Detail navigation can be wired up when a NewsDetailPage exists
    console.debug('Open article', id)
  }

  if (error) {
    return (
      <div className={b}>
        <GlassHeader showBack title={t('title')} />
        <div className={bem(b, 'content')}>
          <EmptyState icon="📰" title={t('common:error.generic')} />
        </div>
      </div>
    )
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={t('title')} />

      <div className={bem(b, 'content')}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <NewsCardSkeleton key={i} />)
        ) : articles.length === 0 ? (
          <EmptyState icon="📰" title={t('common:empty.title')} />
        ) : (
          articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onClick={() => handleArticleClick(article.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
