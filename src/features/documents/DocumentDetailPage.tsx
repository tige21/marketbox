import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { SkeletonGrid } from '@/components/SkeletonGrid'
import { EmptyState } from '@/components/EmptyState'
import { BackendImage } from '@/components/BackendImage'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import type { BackendDocumentationCandidate } from '@/api/types'
import {
  useDocumentation,
  useDocumentationCandidates,
} from './hooks/useDocumentations'
import './DocumentsPage.scss'

const b = 'doc-detail'

interface SpecialistCardProps {
  specialist: BackendDocumentationCandidate
}

function SpecialistCard({ specialist }: SpecialistCardProps) {
  const { t } = useTranslation(['documents', 'common'])
  const lang = useLang()
  const navigate = useNavigate()

  const name = `${pickLocaleStr(specialist.name, lang)} ${pickLocaleStr(specialist.surname, lang)}`.trim()
  const photo = pickLocale(specialist.photo, lang)
  // Card shows only the skills (ability). Age, city, experience and the
  // long description now live on the detail page ("Подробнее").
  const skills = pickLocaleStr(specialist.ability, lang)

  const handleDetails = () => {
    triggerHaptic('tap')
    navigate(`/documents/candidates/${specialist.id}`)
  }

  return (
    <article className={bem(b, 'card')}>
      <div className={bem(b, 'photo-wrap')}>
        <BackendImage
          src={photo}
          alt={name}
          className={bem(b, 'photo')}
        />
      </div>

      <div className={bem(b, 'info')}>
        <h3 className={bem(b, 'name')}>
          {name}
          {specialist.is_verify ? (
            <span className={bem(b, 'name-verified')} aria-label="Verified">
              <img
                src="/app/images/china-guide/verified-purple.svg"
                alt=""
                aria-hidden="true"
              />
            </span>
          ) : null}
        </h3>

        {skills && (
          <>
            <span className={bem(b, 'skills-label')}>
              {t('common:person.skills', { defaultValue: 'Навыки' })}
            </span>
            <p className={bem(b, 'skills')}>{skills}</p>
          </>
        )}
      </div>

      <button
        type="button"
        className={bem(b, 'details-btn')}
        onClick={handleDetails}
        aria-label={t('common:actions.details', { defaultValue: 'Подробнее' }) + ' — ' + name}
      >
        {t('common:actions.details', { defaultValue: 'Подробнее' })}
      </button>
    </article>
  )
}

export function DocumentDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation(['common'])
  const lang = useLang()
  const numericId = id ? Number(id) : undefined

  const { data: doc, isError: docError } = useDocumentation(numericId)
  const { data: candidates = [], isLoading, error } = useDocumentationCandidates(numericId)

  if (!id || docError) return <Navigate to="/documents" replace />

  const title = doc ? pickLocaleStr(doc.title, lang) : ''

  return (
    <div className={b}>
      <GlassHeader showBack size="bold" title={title.toUpperCase()} />

      <div className={bem(b, 'content')}>
        {isLoading ? (
          <div className={bem(b, 'grid')}>
            <SkeletonGrid count={4} height={400} borderRadius={20} />
          </div>
        ) : error ? (
          <EmptyState icon="👤" title={t('common:error.generic')} />
        ) : candidates.length === 0 ? (
          <EmptyState icon="👤" title={t('common:empty.title')} />
        ) : (
          <div className={bem(b, 'grid')}>
            {candidates.map((s) => <SpecialistCard key={s.id} specialist={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}
