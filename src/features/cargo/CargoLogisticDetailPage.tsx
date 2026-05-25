import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BackButton } from '@/components/BackButton'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BackendImage } from '@/components/BackendImage'
import { bem } from '@/utils/cn'
import { cargoLogisticsApi } from '@/api/endpoints'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import './CargoPage.scss'

const b = 'cargo-logistic-detail'
const STALE = 5 * 60 * 1000

function GlobeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="11" cy="11" rx="4" ry="8" stroke="currentColor" strokeWidth="1.6" />
      <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M4.5 4.5a1.5 1.5 0 0 1 1.5-1.5h2.2a1 1 0 0 1 1 .76l.8 3a1 1 0 0 1-.34 1.04L7.9 9.4a12 12 0 0 0 4.7 4.7l1.6-1.76a1 1 0 0 1 1.04-.34l3 .8a1 1 0 0 1 .76 1V16a1.5 1.5 0 0 1-1.5 1.5C9.85 17.5 4.5 12.15 4.5 4.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6l7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M11 2c-3.59 0-6.5 2.91-6.5 6.5 0 4.88 6.5 11.5 6.5 11.5s6.5-6.62 6.5-11.5C17.5 4.91 14.59 2 11 2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function looksLikeUrl(s: string | null | undefined): boolean {
  if (!s) return false
  return /^https?:\/\//i.test(s) || /^www\./i.test(s) || /\.[a-z]{2,}/i.test(s)
}

export function CargoLogisticDetailPage() {
  const { itemId = '' } = useParams<{ itemId: string }>()
  const { t } = useTranslation(['cargo', 'common'])
  const lang = useLang()

  const numId = Number(itemId)
  const validId = Number.isFinite(numId) && numId > 0 ? numId : undefined

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['cargo-logistic', 'detail', validId, lang],
    queryFn: () =>
      cargoLogisticsApi
        .getById(validId as number, { lang })
        .then((r) => r.data.data),
    enabled: validId != null,
    staleTime: STALE,
  })

  const image = item ? pickLocale(item.image, lang) : null
  const description =
    (item && pickLocaleStr(item.description ?? '', lang)) ||
    (item && pickLocaleStr(item.preview_text, lang)) ||
    ''
  const website = item?.website || (looksLikeUrl(item?.url) ? item?.url ?? null : null)
  const phone = item?.phone ?? null
  const email = item?.email ?? null
  const address = item?.address ?? null
  const hasContact = !!(website || phone || email || address)

  const pageTitle = t('cargo:detail.page_title')

  if (error) {
    return (
      <div className={b}>
        <BackButton block={b} to={-1} ariaLabel={t('common:actions.back')} />
        <EmptyState icon="😞" title={t('common:error.generic')} />
      </div>
    )
  }

  return (
    <div className={b}>
      <BackButton block={b} to={-1} ariaLabel={t('common:actions.back')} />

      <h1 className={bem(b, 'title')}>{pageTitle}</h1>

      <div className={bem(b, 'body')}>
        {isLoading || !item ? (
          <>
            <Skeleton variant="rect" height={260} borderRadius={20} />
            <Skeleton variant="rect" height={80} borderRadius={20} />
            <Skeleton variant="rect" height={200} borderRadius={20} />
          </>
        ) : (
          <>
            {image && (
              <BackendImage
                src={image}
                alt={pageTitle}
                className={bem(b, 'image')}
              />
            )}

            <section className={bem(b, 'description-card')}>
              <p className={bem(b, 'description', { placeholder: !description })}>
                {description || t('cargo:detail.description_placeholder')}
              </p>
            </section>

            {hasContact && (
              <section className={bem(b, 'contact-card')}>
                <h2 className={bem(b, 'contact-title')}>
                  {t('cargo:detail.contact_get_title')}
                </h2>
                <div className={bem(b, 'contact-divider')} />

                {website && (
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={bem(b, 'contact-row')}
                  >
                    <span className={bem(b, 'contact-icon')} aria-hidden="true">
                      <GlobeIcon />
                    </span>
                    <span className={bem(b, 'contact-text')}>{website}</span>
                  </a>
                )}

                {phone && (
                  <a href={`tel:${phone}`} className={bem(b, 'contact-row')}>
                    <span className={bem(b, 'contact-icon')} aria-hidden="true">
                      <PhoneIcon />
                    </span>
                    <span className={bem(b, 'contact-text')}>{phone}</span>
                  </a>
                )}

                {address && (
                  <div className={bem(b, 'contact-row')}>
                    <span className={bem(b, 'contact-icon')} aria-hidden="true">
                      <PinIcon />
                    </span>
                    <span className={bem(b, 'contact-text')}>{address}</span>
                  </div>
                )}

                {email && (
                  <a href={`mailto:${email}`} className={bem(b, 'contact-row')}>
                    <span className={bem(b, 'contact-icon')} aria-hidden="true">
                      <MailIcon />
                    </span>
                    <span className={bem(b, 'contact-text')}>{email}</span>
                  </a>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
