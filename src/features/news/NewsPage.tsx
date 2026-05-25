import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/EmptyState'
import { BackButton } from '@/components/BackButton'
import { BackendImage } from '@/components/BackendImage'
import type { BackendArticle } from '@/api/types'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { bem } from '@/utils/cn'
import { useHaptic } from '@/hooks/useHaptic'
import { formatBadgeDate } from '@/utils'
import { useArticles } from './hooks/useArticles'
import './NewsPage.scss'

const b = 'news-page'

interface NewsCardProps {
  article: BackendArticle
}

function NewsCard({ article }: NewsCardProps) {
  const { t } = useTranslation('news')
  const lang = useLang()
  const haptic = useHaptic()
  const title = pickLocaleStr(article.title, lang)
  const summary = pickLocaleStr(article.preview_text, lang)
  const image = pickLocale(article.image, lang)
  const ctaUrl = article.url

  const openUrl = () => {
    if (!ctaUrl) return
    haptic.tap()
    window.open(ctaUrl, '_blank', 'noopener,noreferrer')
  }

  const handleClick = () => {
    openUrl()
  }

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openUrl()
  }

  return (
    <article className={bem(b, 'item')}>
      <div
        className={bem(b, 'card')}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label={title}
      >
        <BackendImage
          src={image}
          alt=""
          className={bem(b, 'card-image')}
        />
        <div className={bem(b, 'date-badge')}>
          <img src="/app/images/news/calendar.svg" alt="" aria-hidden="true" />
          <span>{formatBadgeDate(article.date)}</span>
        </div>
        <div className={bem(b, 'glass-bar')}>
          <p className={bem(b, 'glass-text')}>
            <span className={bem(b, 'title-regular')}>{title} </span>
            {summary && <span className={bem(b, 'title-bold')}>{summary}</span>}
          </p>
        </div>
      </div>

      <button type="button" className={bem(b, 'footer')} onClick={handleCtaClick}>
        <span className={bem(b, 'footer-pill')}>{t('cta_participate')}</span>
      </button>
    </article>
  )
}

export function NewsPage() {
  const { t } = useTranslation(['news', 'common'])
  const { data: articles = [], isLoading, error } = useArticles()

  return (
    <div className={b}>
      <BackButton block={b} to="/" />

      <h1 className={bem(b, 'title')}>{t('news:title_uppercase')}</h1>

      <div className={bem(b, 'content')}>
        {error ? (
          <EmptyState icon="📰" title={t('common:error.generic')} />
        ) : isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={bem(b, 'card-skeleton')} />
          ))
        ) : articles.length === 0 ? (
          <EmptyState icon="📰" title={t('common:empty.title')} />
        ) : (
          articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        )}
      </div>
    </div>
  )
}
