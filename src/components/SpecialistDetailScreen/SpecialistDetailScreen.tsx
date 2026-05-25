import { useTranslation } from 'react-i18next'
import { BackButton } from '@/components/BackButton'
import { BackendImage } from '@/components/BackendImage'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './SpecialistDetailScreen.scss'

const b = 'specialist-detail'

export interface SpecialistDetailScreenProps {
  /** Top-of-screen title (uppercase in design). */
  title: string
  /** Path the BackButton points to. */
  backTo: string
  imageUrl?: string | null
  /** Big paragraph shown in the description card (optional). */
  description?: string
  /** Section header above the contact list. Defaults to "Получить контакт". */
  contactsHeader?: string
  /** Optional address (single string — city, region, etc). */
  address?: string
  /** Phone (E.164 or any displayable). */
  phone?: string
  /** Email. */
  email?: string
  /** Public site / link. */
  website?: string
  /** Primary external CTA URL (e.g. Telegram contact). */
  ctaUrl?: string | null
  /** Label for the primary CTA button. */
  ctaLabel?: string
  /** QR-code image URL (China factories use it). */
  qrUrl?: string | null
  /** Show loading skeletons. */
  isLoading?: boolean
  /** Show error empty-state. */
  error?: unknown
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2c2.3 2.3 3.5 5.1 3.5 8s-1.2 5.7-3.5 8c-2.3-2.3-3.5-5.1-3.5-8S7.7 4.3 10 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M18 14.5v2.5a1.5 1.5 0 0 1-1.6 1.5 16.5 16.5 0 0 1-7.2-2.6 16.3 16.3 0 0 1-5-5A16.5 16.5 0 0 1 1.5 3.6 1.5 1.5 0 0 1 3 2h2.5a1.5 1.5 0 0 1 1.5 1.3c.1.7.3 1.5.6 2.2.2.5.1 1.1-.3 1.6L6 8.5a13 13 0 0 0 5 5l1.4-1.3c.4-.4 1-.5 1.5-.3.7.3 1.5.5 2.2.6a1.5 1.5 0 0 1 1.3 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 5l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 1.5C6.4 1.5 3.5 4.4 3.5 8c0 4.9 6.5 10.5 6.5 10.5S16.5 12.9 16.5 8c0-3.6-2.9-6.5-6.5-6.5zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor" />
    </svg>
  )
}

export function SpecialistDetailScreen(props: SpecialistDetailScreenProps) {
  const {
    title,
    backTo,
    imageUrl,
    description,
    contactsHeader,
    address,
    phone,
    email,
    website,
    ctaUrl,
    ctaLabel,
    qrUrl,
    isLoading,
    error,
  } = props
  const { t } = useTranslation('common')

  const open = (url: string) => {
    triggerHaptic('tap')
    window.open(url, '_blank', 'noopener,noreferrer')
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
            <Skeleton variant="rect" height={240} borderRadius={20} />
            <Skeleton variant="rect" height={120} borderRadius={16} />
            <Skeleton variant="rect" height={180} borderRadius={16} />
          </>
        ) : (
          <>
            {title && <h1 className={bem(b, 'title')}>{title.toUpperCase()}</h1>}

            {imageUrl && (
              <BackendImage
                src={imageUrl}
                alt={title}
                className={bem(b, 'image')}
              />
            )}

            {description && (
              <div className={bem(b, 'desc-card')}>
                <p className={bem(b, 'desc-text')}>{description}</p>
              </div>
            )}

            {(address || phone || email || website) && (
              <div className={bem(b, 'contacts-card')}>
                <h2 className={bem(b, 'contacts-header')}>
                  {contactsHeader ??
                    t('detail.contacts', { defaultValue: 'Получить контакт' })}
                </h2>
                <ul className={bem(b, 'contacts-list')}>
                  {website && (
                    <li
                      className={bem(b, 'contact-row')}
                      onClick={() => open(website)}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={bem(b, 'contact-icon')} aria-hidden="true">
                        <GlobeIcon />
                      </span>
                      <span className={bem(b, 'contact-text')}>{website}</span>
                    </li>
                  )}
                  {phone && (
                    <li
                      className={bem(b, 'contact-row')}
                      onClick={() => open(`tel:${phone}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={bem(b, 'contact-icon')} aria-hidden="true">
                        <PhoneIcon />
                      </span>
                      <span className={bem(b, 'contact-text')}>{phone}</span>
                    </li>
                  )}
                  {email && (
                    <li
                      className={bem(b, 'contact-row')}
                      onClick={() => open(`mailto:${email}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={bem(b, 'contact-icon')} aria-hidden="true">
                        <MailIcon />
                      </span>
                      <span className={bem(b, 'contact-text')}>{email}</span>
                    </li>
                  )}
                  {address && (
                    <li className={bem(b, 'contact-row')}>
                      <span className={bem(b, 'contact-icon')} aria-hidden="true">
                        <PinIcon />
                      </span>
                      <span className={bem(b, 'contact-text')}>{address}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {qrUrl && (
              <div className={bem(b, 'qr-block')}>
                <BackendImage
                  src={qrUrl}
                  alt="QR"
                  className={bem(b, 'qr')}
                />
                <span className={bem(b, 'qr-label')}>QR КОД</span>
              </div>
            )}

            {ctaUrl && (
              <button
                type="button"
                className={bem(b, 'cta')}
                onClick={() => open(ctaUrl)}
              >
                {ctaLabel || t('detail.contact_btn', { defaultValue: 'Получить контакт' })}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
