import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { triggerHaptic } from '@/utils'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BackButton } from '@/components/BackButton'
import { BackendImage } from '@/components/BackendImage'
import { bem } from '@/utils/cn'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { useSeller } from './hooks/useWholesale'
import './WholesalePage.scss'

const b = 'wholesale-detail'

export function WholesaleDetailPage() {
  const { t } = useTranslation(['wholesale', 'common'])
  const lang = useLang()
  const { id = '' } = useParams<{ id: string }>()
  const { data: seller, isLoading, error } = useSeller(id)

  const title = seller ? pickLocaleStr(seller.title, lang) : ''
  const address = seller ? pickLocaleStr(seller.address, lang) : ''
  const image = seller ? pickLocale(seller.image, lang) : null
  const ctaUrl = seller?.url ?? null
  const ctaLabel = seller ? pickLocaleStr(seller.title_url, lang) : ''

  const handleCta = () => {
    if (!ctaUrl) return
    triggerHaptic('tap')
    window.open(ctaUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={b}>
      <BackButton block={b} to="/wholesale" />

      <h1 className={bem(b, 'title')}>{title || t('title')}</h1>

      <div className={bem(b, 'body')}>
        {isLoading ? (
          <>
            <Skeleton variant="rect" width="100%" height={200} borderRadius={20} />
            <Skeleton variant="text" width="90%" height={22} />
            <Skeleton variant="text" width="80%" height={22} />
            <Skeleton variant="rect" width={263} height={58} borderRadius={999} />
          </>
        ) : error || !seller ? (
          <EmptyState icon="😞" title={t('common:error.generic')} />
        ) : (
          <>
            {image && (
              <BackendImage
                src={image}
                alt={title}
                className={bem(b, 'image')}
              />
            )}

            {address && <p className={bem(b, 'desc')}>{address}</p>}

            {ctaUrl && (
              <button
                type="button"
                className={bem(b, 'telegram-btn')}
                onClick={handleCta}
              >
                {ctaLabel || t('telegram_button')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
