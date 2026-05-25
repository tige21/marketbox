import { useTranslation } from 'react-i18next'
import { BackButton } from '@/components/BackButton'
import { BackendImage } from '@/components/BackendImage'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './PersonDetailScreen.scss'

const b = 'person-detail'

export interface PersonDetailScreenProps {
  /** Section label shown above the name (e.g., "Дизайнеры"). */
  categoryTitle: string
  /** Person's full name. */
  name: string
  /** Path the BackButton points to. */
  backTo: string
  photoUrl?: string | null
  /** Short preview / about. */
  preview?: string
  age?: number | string | null
  /** Skills / specialty / ability. */
  skills?: string
  /** Years of experience or free-form text. */
  experience?: string
  /** Address line at the bottom. */
  address?: string
  /** External contact URL (Telegram, etc). */
  contactUrl?: string | null
  /** Loading state. */
  isLoading?: boolean
  /** Error from useQuery. */
  error?: unknown
}

function PreviewIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="9" y="5.5" width="10" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="9" y="10.5" width="10" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="15" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="9" y="15.5" width="10" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}
function AgeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="2" x2="15" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function SkillsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M14 4l1.5 3 3 1.5L15.5 10 14 13l-1.5-3L9.5 8.5 12.5 7 14 4z" fill="currentColor" />
      <path d="M4 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" />
      <line x1="11" y1="11" x2="6" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function BriefcaseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 1.5C7.4 1.5 4.5 4.4 4.5 8c0 4.9 6.5 12 6.5 12s6.5-7.1 6.5-12c0-3.6-2.9-6.5-6.5-6.5zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor" />
    </svg>
  )
}
function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface RowProps {
  icon: React.ReactNode
  label: string
  value?: string | number | null
}
function Row({ icon, label, value }: RowProps) {
  if (value == null || value === '') return null
  return (
    <div className={bem(b, 'row')}>
      <div className={bem(b, 'row-head')}>
        <span className={bem(b, 'row-icon')} aria-hidden="true">{icon}</span>
        <span className={bem(b, 'row-label')}>{label}</span>
      </div>
      <span className={bem(b, 'row-value')}>{value}</span>
    </div>
  )
}

export function PersonDetailScreen(props: PersonDetailScreenProps) {
  const {
    categoryTitle,
    name,
    backTo,
    photoUrl,
    preview,
    age,
    skills,
    experience,
    address,
    contactUrl,
    isLoading,
    error,
  } = props
  const { t } = useTranslation('common')

  const handleContact = () => {
    if (!contactUrl) return
    triggerHaptic('tap')
    window.open(contactUrl, '_blank', 'noopener,noreferrer')
  }

  if (error) {
    return (
      <div className={b}>
        <BackButton block={b} to={backTo} />
        <EmptyState icon="😞" title={t('error.generic')} />
      </div>
    )
  }

  return (
    <div className={b}>
      <BackButton block={b} to={backTo} />

      <div className={bem(b, 'body')}>
        {isLoading ? (
          <>
            <Skeleton variant="rect" height={28} width="60%" borderRadius={6} />
            <Skeleton variant="rect" height={20} width="50%" borderRadius={6} />
            <Skeleton variant="rect" height={280} borderRadius={20} />
            <Skeleton variant="rect" height={60} borderRadius={16} />
            <Skeleton variant="rect" height={60} borderRadius={16} />
            <Skeleton variant="rect" height={60} borderRadius={16} />
            <Skeleton variant="rect" height={60} borderRadius={16} />
            <Skeleton variant="rect" height={50} borderRadius={14} />
          </>
        ) : (
          <>
            <div className={bem(b, 'header')}>
              {categoryTitle && (
                <h1 className={bem(b, 'category')}>{categoryTitle}</h1>
              )}
              {name && <h2 className={bem(b, 'name')}>{name}</h2>}
            </div>

            <div className={bem(b, 'photo-wrap')}>
              {photoUrl ? (
                <BackendImage
                  src={photoUrl}
                  alt={name}
                  className={bem(b, 'photo')}
                />
              ) : (
                <div className={bem(b, 'photo-placeholder')} aria-hidden="true" />
              )}
            </div>

            <div className={bem(b, 'rows')}>
              <Row icon={<PreviewIcon />} label={t('person.preview', { defaultValue: 'Превью' })} value={preview} />
              <Row icon={<AgeIcon />} label={t('person.age', { defaultValue: 'Возраст' })} value={age} />
              <Row icon={<SkillsIcon />} label={t('person.skills', { defaultValue: 'Навыки' })} value={skills} />
              <Row icon={<BriefcaseIcon />} label={t('person.experience', { defaultValue: 'Опыт' })} value={experience} />
            </div>

            {address && (
              <div className={bem(b, 'row', { address: true })}>
                <div className={bem(b, 'row-head')}>
                  <span className={bem(b, 'row-icon')} aria-hidden="true"><PinIcon /></span>
                  <span className={bem(b, 'row-label')}>
                    {t('person.address', { defaultValue: 'Адрес' })}
                  </span>
                </div>
                <span className={bem(b, 'row-value')}>{address}</span>
              </div>
            )}

            {contactUrl && (
              <button
                type="button"
                className={bem(b, 'cta')}
                onClick={handleContact}
              >
                <SendIcon />
                <span>{t('person.contact', { defaultValue: 'Связаться' })}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
