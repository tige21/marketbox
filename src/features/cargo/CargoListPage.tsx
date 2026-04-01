import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { SkeletonCard } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { useCargo } from './hooks/useCargo'
import type { CargoType } from '@/api/types'
import './CargoPage.scss'

interface CargoListPageProps {
  type: 'logistics' | 'fulfillment'
}

const b = 'cargo-list'

export function CargoListPage({ type }: CargoListPageProps) {
  const { t } = useTranslation(['cargo', 'common'])
  const navigate = useNavigate()

  const cargoType: CargoType = type === 'logistics' ? 'black' : 'fulfillment'
  const { data: services, isLoading, error } = useCargo(cargoType)

  const pageTitle = type === 'logistics'
    ? t('cargo:list.logistics_title')
    : t('cargo:list.fulfillment_title')

  if (error) {
    return <EmptyState icon="😞" title={t('common:error.generic')} />
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={pageTitle} size="large" />

      <div className={bem(b, 'body')}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : !services?.length
          ? <EmptyState icon="🚢" title={t('common:empty.title')} />
          : services.map(service => (
              <article
                key={service.id}
                className={bem(b, 'card')}
                onClick={() => {
                  triggerHaptic('tap')
                  navigate(`/cargo/${service.id}`)
                }}
              >
                <img
                  src={service.logoUrl}
                  alt={service.companyName}
                  className={bem(b, 'logo')}
                  loading="lazy"
                  decoding="async"
                />
                <div className={bem(b, 'info')}>
                  <h3 className={bem(b, 'name')}>{service.companyName}</h3>
                  <p className={bem(b, 'countries-label')}>
                    {t('cargo:list.countries_label')}
                  </p>
                  <p className={bem(b, 'flags')}>
                    {service.countries ?? '🇨🇳🇷🇺'}
                  </p>
                  <button
                    type="button"
                    className={bem(b, 'details-btn')}
                    onClick={e => {
                      e.stopPropagation()
                      triggerHaptic('select')
                      navigate(`/cargo/${service.id}`)
                    }}
                  >
                    {t('cargo:list.details_btn')}
                  </button>
                </div>
              </article>
            ))
        }
      </div>
    </div>
  )
}
