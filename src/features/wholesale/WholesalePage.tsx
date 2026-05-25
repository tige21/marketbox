import { Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BackButton } from '@/components/BackButton'
import { MarketCard } from './components'
import { useWholesale } from './hooks/useWholesale'
import { WholesaleDetailPage } from './WholesaleDetailPage'
import { triggerHaptic } from '@/utils'
import { bem } from '@/utils/cn'
import './WholesalePage.scss'

const b = 'wholesale-page'

function WholesaleList() {
  const { t } = useTranslation(['wholesale', 'common'])
  const navigate = useNavigate()
  const { data: sellers, isLoading, error } = useWholesale()

  return (
    <div className={b}>
      <BackButton block={b} to="/" />

      <h1 className={bem(b, 'title')}>{t('wholesale:title')}</h1>

      <div className={bem(b, 'content')}>
        {error && <EmptyState icon="😞" title={t('common:error.generic')} />}
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rect" height={171} className={bem(b, 'skeleton')} />
            ))
          : sellers?.map(seller => (
              <MarketCard
                key={seller.id}
                seller={seller}
                onClick={() => {
                  triggerHaptic('tap')
                  navigate(`/wholesale/${seller.id}`)
                }}
              />
            ))
        }
      </div>
    </div>
  )
}

export function WholesalePage() {
  return (
    <Routes>
      <Route index element={<WholesaleList />} />
      <Route path=":id" element={<WholesaleDetailPage />} />
    </Routes>
  )
}
