import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { documentsApi } from '@/api/endpoints'
import type { DocumentCategory } from '@/api/types'
import { GlassHeader } from '@/components/GlassHeader'
import { GlassButton } from '@/components/GlassButton'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/Badge'
import { PremiumGate } from '@/components/PremiumGate'
import { bem, cn } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import './DocumentsPage.scss'

type TabId = 'all' | DocumentCategory

interface Tab {
  id: TabId
  labelKey: string
}

const TABS: Tab[] = [
  { id: 'all',          labelKey: 'documents:tab.all' },
  { id: 'contracts',    labelKey: 'documents:tab.contracts' },
  { id: 'certificates', labelKey: 'documents:tab.certificates' },
  { id: 'guides',       labelKey: 'documents:tab.guides' },
  { id: 'templates',    labelKey: 'documents:tab.templates' },
]

const FILE_TYPE_EMOJI: Record<string, string> = {
  pdf:  '📄',
  docx: '📝',
  xlsx: '📊',
}

const CATEGORY_VARIANT_MAP: Record<DocumentCategory, 'accent' | 'success' | 'warning' | 'default'> = {
  contracts:    'accent',
  certificates: 'success',
  guides:       'warning',
  templates:    'default',
}

const b = 'documents-page'

export function DocumentsPage() {
  const { t } = useTranslation(['documents', 'common'])
  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [premiumOpen, setPremiumOpen] = useState(false)

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await documentsApi.getList()
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const filtered = documents
    ? activeTab === 'all'
      ? documents
      : documents.filter(doc => doc.category === activeTab)
    : []

  function handleTabChange(id: TabId) {
    triggerHaptic('select')
    setActiveTab(id)
  }

  function handleDownload(isPremium: boolean, fileUrl: string) {
    triggerHaptic('tap')
    if (isPremium) {
      setPremiumOpen(true)
      return
    }
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  if (error) return <EmptyState icon="😞" title={t('common:error.generic')} />

  return (
    <div className={b}>
      <GlassHeader showBack title={t('documents:title')} />

      {/* Category filter tabs */}
      <div className={bem(b, 'tabs')} role="tablist" aria-label={t('documents:title')}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={cn(bem(b, 'tab', { active: activeTab === tab.id }))}
            onClick={() => handleTabChange(tab.id)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Document grid */}
      <div className={bem(b, 'content')}>
        {isLoading ? (
          <div className={bem(b, 'grid')}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={bem(b, 'skeleton-card')}>
                <Skeleton variant="rect" height={120} />
                <Skeleton variant="text" height={14} width="80%" />
                <Skeleton variant="text" height={11} width="60%" />
              </div>
            ))}
          </div>
        ) : !filtered.length ? (
          <EmptyState icon="📂" title={t('common:empty.title')} />
        ) : (
          <div className={bem(b, 'grid')}>
            {filtered.map(doc => (
              <article
                key={doc.id}
                className={cn(bem(b, 'card', { premium: doc.isPremium }))}
                aria-label={doc.title}
              >
                {/* File type icon area */}
                <div className={bem(b, 'card-thumb')}>
                  <span className={bem(b, 'card-file-emoji')} aria-hidden="true">
                    {FILE_TYPE_EMOJI[doc.fileType] ?? '📄'}
                  </span>
                  <span className={bem(b, 'card-file-type')}>
                    {doc.fileType.toUpperCase()}
                  </span>
                  <Badge
                    variant={CATEGORY_VARIANT_MAP[doc.category]}
                    className={bem(b, 'card-category-badge')}
                  >
                    {t(`documents:category.${doc.category}`)}
                  </Badge>
                  {/* Premium overlay on thumb */}
                  {doc.isPremium && (
                    <div className={bem(b, 'card-thumb-lock')} aria-label={t('common:premium.title')}>
                      <span aria-hidden="true">🔒</span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className={bem(b, 'card-body')}>
                  <h3 className={bem(b, 'card-title')}>{doc.title}</h3>
                  <p className={bem(b, 'card-description')}>{doc.description}</p>

                  <div className={bem(b, 'card-meta')}>
                    <span className={bem(b, 'card-downloads')}>
                      <span aria-hidden="true">⬇</span>
                      {' '}{doc.downloadCount}
                    </span>
                    <span className={bem(b, 'card-size')}>{doc.fileSize}</span>
                  </div>

                  <GlassButton
                    variant={doc.isPremium ? 'premium' : 'secondary'}
                    size="sm"
                    fullWidth
                    className={bem(b, 'card-download-btn')}
                    onClick={() => handleDownload(doc.isPremium, doc.fileUrl)}
                  >
                    {doc.isPremium
                      ? t('common:premium.upgrade')
                      : t('documents:action.download')}
                  </GlassButton>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <PremiumGate open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  )
}
