import { useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { EmptyState } from '@/components/EmptyState'
import { BackendImage } from '@/components/BackendImage'
import { bem } from '@/utils/cn'
import { useHaptic } from '@/hooks/useHaptic'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { formatBadgeDate } from '@/utils'
import { useArticle } from './hooks/useArticles'
import './NewsPage.scss'

const b = 'news-detail'

export function NewsDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation(['news', 'common'])
  const lang = useLang()
  const haptic = useHaptic()
  const numericId = id ? Number(id) : undefined
  const { data: article, isLoading, isError } = useArticle(numericId)

  if (!id) return <Navigate to="/news" replace />

  const title = article ? pickLocaleStr(article.title, lang) : ''
  const image = article ? pickLocale(article.image, lang) : ''
  const summary = article ? pickLocaleStr(article.preview_text, lang) : ''
  const content = article ? pickLocaleStr(article.content, lang) : ''
  const sourceUrl = article?.url

  return (
    <div className={b}>
      <GlassHeader showBack size="bold" title={(title || t('news:title')).toUpperCase()} />

      <div className={bem(b, 'body')}>
        {isError ? (
          <EmptyState icon="📰" title={t('common:error.generic')} />
        ) : isLoading || !article ? (
          <div className={bem(b, 'skeleton')} />
        ) : (
          <>
            {/* Hero image */}
            <div className={bem(b, 'hero')}>
              <BackendImage src={image} alt={title} className={bem(b, 'hero-image')} />
              {article.date && (
                <div className={bem(b, 'date-badge')}>
                  <img src="/app/images/news/calendar.svg" alt="" aria-hidden="true" />
                  <span>{formatBadgeDate(article.date)}</span>
                </div>
              )}
            </div>

            {/* About-style glass card (mirrors cargo detail) */}
            <div className={bem(b, 'card')}>
              <h2 className={bem(b, 'name')}>{title}</h2>
              {summary && <p className={bem(b, 'tagline')}>{summary}</p>}
              {content && (
                // Article body is trusted backend content (same model as the
                // lesson embed). Rendered as HTML so CMS markup shows; plain
                // text falls through unchanged.
                <div
                  className={bem(b, 'text')}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>

            {sourceUrl && (
              <button
                type="button"
                className={bem(b, 'source')}
                onClick={() => {
                  haptic.tap()
                  window.open(sourceUrl, '_blank', 'noopener,noreferrer')
                }}
              >
                {t('news:read_at_source')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
