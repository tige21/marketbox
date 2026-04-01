import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { EmptyState } from '@/components/EmptyState'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { useCargoDetail } from './hooks/useCargo'
import './CargoPage.scss'

const b = 'cargo-detail'

export function CargoDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { t } = useTranslation(['cargo', 'common'])
  const { data: service, isLoading, error } = useCargoDetail(id)

  if (error) {
    return (
      <div className={b}>
        <GlassHeader showBack size="medium" title="" />
        <EmptyState icon="😞" title={t('common:error.generic')} />
      </div>
    )
  }

  if (isLoading || !service) {
    return (
      <div className={b}>
        <GlassHeader showBack size="medium" title="" />
        <div className={bem(b, 'body')} />
      </div>
    )
  }

  function handleTelegram() {
    triggerHaptic('tap')
    window.open(`https://t.me/${service!.telegram.replace('@', '')}`, '_blank', 'noopener,noreferrer')
  }

  function handlePhone() {
    triggerHaptic('tap')
    window.open(`tel:${service!.phone}`)
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title={service.companyName} />

      <div className={bem(b, 'body')}>
        {/* Logo + name + rating */}
        <div className={bem(b, 'hero')}>
          <img
            src={service.logoUrl}
            alt={service.companyName}
            className={bem(b, 'logo')}
            loading="eager"
          />
          <div className={bem(b, 'hero-info')}>
            <h1 className={bem(b, 'name')}>{service.companyName}</h1>
            <div className={bem(b, 'rating')}>
              <span className={bem(b, 'stars')}>⭐ {service.rating}</span>
              <span className={bem(b, 'reviews')}>({service.reviewsCount})</span>
            </div>
            {service.countries && (
              <p className={bem(b, 'countries')}>{service.countries}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className={bem(b, 'stats')}>
          <div className={bem(b, 'stat')}>
            <span className={bem(b, 'stat-value')}>{service.pricePerKg} {service.currency}</span>
            <span className={bem(b, 'stat-label')}>{t('cargo:price_per_kg')}</span>
          </div>
          <div className={bem(b, 'stat-divider')} />
          <div className={bem(b, 'stat')}>
            <span className={bem(b, 'stat-value')}>{service.deliveryDays}</span>
            <span className={bem(b, 'stat-label')}>{t('cargo:delivery_days')}</span>
          </div>
        </div>

        {/* Description */}
        <div className={bem(b, 'section')}>
          <h2 className={bem(b, 'section-title')}>{t('cargo:detail.about')}</h2>
          <p className={bem(b, 'description')}>{service.description}</p>
        </div>

        {/* Contacts */}
        <div className={bem(b, 'section')}>
          <h2 className={bem(b, 'section-title')}>{t('cargo:detail.contacts')}</h2>
          <div className={bem(b, 'contacts')}>
            <button type="button" className={bem(b, 'contact-btn', { telegram: true })} onClick={handleTelegram}>
              <span>✈</span>
              <span>{service.telegram}</span>
            </button>
            <button type="button" className={bem(b, 'contact-btn', { phone: true })} onClick={handlePhone}>
              <span>📞</span>
              <span>{service.phone}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
