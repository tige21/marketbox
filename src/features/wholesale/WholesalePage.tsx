import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { MarketCard } from './components'
import { useWholesale } from './hooks/useWholesale'
import { bem } from '@/utils/cn'
import './WholesalePage.scss'

const b = 'wholesale-page'

export function WholesalePage() {
  const { t } = useTranslation(['wholesale', 'common'])
  const { data: sellers, isLoading, error } = useWholesale()

  return (
    <div className={b}>
      <GlassHeader showBack title={t('wholesale:title')} />
      <div className={bem(b, 'content')}>
        {error && <EmptyState icon="😞" title={t('common:error.generic')} />}
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rect" height={171} className={bem(b, 'skeleton')} />
            ))
          : sellers?.map(seller => (
              <MarketCard key={seller.id} seller={seller} />
            ))
        }
      </div>
    </div>
  )
}
