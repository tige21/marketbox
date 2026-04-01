import { useTranslation } from 'react-i18next'
import { GlassCard } from '@/components/GlassCard'
import { Badge } from '@/components/Badge'
import { bem } from '@/utils/cn'
import type { CargoService } from '@/api/types'
import './CargoCard.scss'

interface CargoCardProps {
  cargo: CargoService
  onClick: () => void
}

const b = 'cargo-card'

export function CargoCard({ cargo, onClick }: CargoCardProps) {
  const { t } = useTranslation('cargo')

  return (
    <GlassCard as="article" className={b} onClick={onClick}>
      <div className={bem(b, 'header')}>
        <img src={cargo.logoUrl} alt={cargo.companyName} className={bem(b, 'logo')} loading="lazy" decoding="async" />
        <div className={bem(b, 'company')}>
          <h3 className={bem(b, 'name')}>{cargo.companyName}</h3>
          <div className={bem(b, 'badges')}>
            <Badge variant="accent">{t(`filter.${cargo.type}`)}</Badge>
            {cargo.isVerified && <Badge variant="success">{t('verified')}</Badge>}
            {cargo.isPremium && <Badge variant="premium">Premium</Badge>}
          </div>
        </div>
        <div className={bem(b, 'rating')}>
          <span>⭐ {cargo.rating}</span>
          <span className={bem(b, 'reviews')}>{cargo.reviewsCount}</span>
        </div>
      </div>
      <p className={bem(b, 'description')}>{cargo.description}</p>
      <div className={bem(b, 'footer')}>
        <div className={bem(b, 'price')}>
          <span className={bem(b, 'price-value')}>{cargo.pricePerKg} {cargo.currency}</span>
          <span className={bem(b, 'price-label')}>{t('price_per_kg')}</span>
        </div>
        <div className={bem(b, 'delivery')}>
          <span className={bem(b, 'delivery-value')}>{cargo.deliveryDays}</span>
          <span className={bem(b, 'delivery-label')}>{t('delivery_days')}</span>
        </div>
      </div>
    </GlassCard>
  )
}
