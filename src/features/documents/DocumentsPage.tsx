import { Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { SkeletonGrid } from '@/components/SkeletonGrid'
import { EmptyState } from '@/components/EmptyState'
import { BackendImage } from '@/components/BackendImage'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { DocumentDetailPage } from './DocumentDetailPage'
import { DocumentationCandidateDetailPage } from './DocumentationCandidateDetailPage'
import { useDocumentations } from './hooks/useDocumentations'
import './DocumentsPage.scss'

const b = 'documents-page'

function DocumentsList() {
  const { t } = useTranslation(['documents', 'common'])
  const navigate = useNavigate()
  const lang = useLang()
  const { data: items = [], isLoading, error } = useDocumentations()

  const handleOpen = (id: number) => {
    triggerHaptic('tap')
    navigate(`/documents/${id}`)
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="bold" title={t('documents:title_uppercase')} />

      <div className={bem(b, 'content')}>
        {isLoading ? (
          <SkeletonGrid count={4} height={180} borderRadius={20} />
        ) : error ? (
          <EmptyState icon="📄" title={t('common:error.generic')} />
        ) : items.length === 0 ? (
          <EmptyState icon="📄" title={t('common:empty.title')} />
        ) : (
          items.map((doc) => {
            const title = pickLocaleStr(doc.title, lang)
            const img = pickLocale(doc.image, lang)
            return (
              <button
                key={doc.id}
                type="button"
                className={bem(b, 'card')}
                onClick={() => handleOpen(doc.id)}
                aria-label={title}
              >
                <BackendImage
                  src={img}
                  alt=""
                  className={bem(b, 'card-image')}
                />
                <div className={bem(b, 'card-bar')}>
                  <span className={bem(b, 'card-title')}>{title}</span>
                  <span className={bem(b, 'card-chevron')} aria-hidden="true">
                    <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
                      <path
                        d="M0.75 1.25L5.75 6.25L0.75 11.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export function DocumentsPage() {
  return (
    <Routes>
      <Route index element={<DocumentsList />} />
      <Route path="candidates/:candidateId" element={<DocumentationCandidateDetailPage />} />
      <Route path=":id" element={<DocumentDetailPage />} />
    </Routes>
  )
}
