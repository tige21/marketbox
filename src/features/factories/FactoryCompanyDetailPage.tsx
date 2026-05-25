import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BackButton } from '@/components/BackButton'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BackendImage } from '@/components/BackendImage'
import { bem } from '@/utils/cn'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { useCompany, useFabric } from './hooks'
import './FactoriesPage.scss'

const b = 'factory-company-detail'

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

// QR placeholder shown when backend doesn't ship a real QR image yet.
function QrPlaceholderIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="20" height="20" stroke="currentColor" strokeWidth="2" />
      <rect x="12" y="12" width="8" height="8" fill="currentColor" />
      <rect x="46" y="6" width="20" height="20" stroke="currentColor" strokeWidth="2" />
      <rect x="52" y="12" width="8" height="8" fill="currentColor" />
      <rect x="6" y="46" width="20" height="20" stroke="currentColor" strokeWidth="2" />
      <rect x="12" y="52" width="8" height="8" fill="currentColor" />
      <rect x="32" y="32" width="4" height="4" fill="currentColor" />
      <rect x="40" y="32" width="4" height="4" fill="currentColor" />
      <rect x="48" y="38" width="4" height="4" fill="currentColor" />
      <rect x="32" y="40" width="4" height="4" fill="currentColor" />
      <rect x="56" y="44" width="4" height="4" fill="currentColor" />
      <rect x="40" y="48" width="4" height="4" fill="currentColor" />
      <rect x="48" y="56" width="4" height="4" fill="currentColor" />
      <rect x="32" y="56" width="4" height="4" fill="currentColor" />
      <rect x="56" y="56" width="4" height="4" fill="currentColor" />
    </svg>
  )
}

function looksLikeUrl(s: string | null | undefined): boolean {
  if (!s) return false
  return /^https?:\/\//i.test(s) || /^www\./i.test(s) || /\.[a-z]{2,}/i.test(s)
}

export function FactoryCompanyDetailPage() {
  const { countryCode = '', companyId = '' } = useParams<{
    countryCode: string
    sectionId: string
    companyId: string
  }>()
  const { t } = useTranslation(['factories', 'common'])
  const lang = useLang()

  const numId = Number(companyId)
  const validId = Number.isFinite(numId) && numId > 0 ? numId : undefined
  const { data: company, isLoading, error } = useCompany(validId)

  const fabricId = Number(countryCode)
  const { data: fabric } = useFabric(
    Number.isFinite(fabricId) ? fabricId : undefined,
  )
  const isChinese = !!fabric?.wechat

  // Page title: Chinese factories get the WeChat-style layout; others get
  // the "ОСТАЛЬНЫЕ ЗАВОДЫ" header.
  const pageTitle = isChinese
    ? t('factories:title_china_factories')
    : t('factories:title_other_factories')

  const image = company ? pickLocale(company.image, lang) : null
  const qrCode = company ? pickLocale(company.qr_code, lang) : null
  const description =
    (company && pickLocaleStr(company.description ?? '', lang)) ||
    (company && pickLocaleStr(company.preview_description, lang)) ||
    ''
  // Backend has only a single `url` field today. Treat it as the website
  // when it looks like an HTTP(S) URL; otherwise hide. Phone/email/address
  // are forward-compatible optional fields admin can populate later.
  const website = company?.website || (looksLikeUrl(company?.url) ? company?.url : null)
  const phone = company?.phone ?? null
  const email = company?.email ?? null
  const address = company?.address ?? null
  const hasContact = !!(website || phone || email || address)

  // Chinese factories use "КОНТАКТНАЯ ИНФОРМАЦИЯ"; others use "ПОЛУЧИТЬ КОНТАКТ".
  const contactCardTitle = isChinese
    ? t('factories:contact_info_title')
    : t('factories:contact_get_title')

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
        {isLoading || !company ? (
          <>
            <Skeleton variant="rect" height={220} borderRadius={20} />
            <Skeleton variant="rect" height={80} borderRadius={20} />
            <Skeleton variant="rect" height={180} borderRadius={20} />
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
                {description || t('factories:description_placeholder')}
              </p>
            </section>

            {hasContact && (
              <section className={bem(b, 'contact-card')}>
                <h2 className={bem(b, 'contact-title')}>{contactCardTitle}</h2>
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

                {email && (
                  <a href={`mailto:${email}`} className={bem(b, 'contact-row')}>
                    <span className={bem(b, 'contact-icon')} aria-hidden="true">
                      <MailIcon />
                    </span>
                    <span className={bem(b, 'contact-text')}>{email}</span>
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
              </section>
            )}

            {isChinese && (
              <section className={bem(b, 'qr-card')}>
                <div className={bem(b, 'qr-frame')}>
                  {qrCode ? (
                    <BackendImage
                      src={qrCode}
                      alt="WeChat QR"
                      className={bem(b, 'qr')}
                    />
                  ) : (
                    <span
                      className={bem(b, 'qr-placeholder')}
                      aria-hidden="true"
                    >
                      <QrPlaceholderIcon />
                    </span>
                  )}
                </div>
                <span className={bem(b, 'qr-label')}>
                  {t('factories:qr_label')}
                </span>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
