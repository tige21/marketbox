import { memo } from 'react'
import { bem } from '@/utils/cn'
import { BackendImage } from '@/components/BackendImage'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import type { BackendSeller } from '@/api/types'
import './MarketCard.scss'

const b = 'market-card'

interface MarketCardProps {
  seller: BackendSeller
  onClick?: () => void
}

function ChevronRightIcon() {
  return (
    <svg
      width="10"
      height="18"
      viewBox="0 0 10 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.5 1.5L8 9L1.5 16.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const MarketCard = memo(function MarketCard({ seller, onClick }: MarketCardProps) {
  const lang = useLang()
  const name = pickLocaleStr(seller.title, lang)
  const address = pickLocaleStr(seller.address, lang)
  const image = pickLocale(seller.image, lang)

  return (
    <button type="button" className={b} onClick={onClick} aria-label={name}>
      <BackendImage
        src={image}
        alt={name}
        className={bem(b, 'image')}
      />
      <div className={bem(b, 'info-bar')}>
        <div className={bem(b, 'info-content')}>
          <span className={bem(b, 'name')}>{name}</span>
          <span className={bem(b, 'address-row')}>
            <img
              className={bem(b, 'location-icon')}
              src="/app/images/wholesale/location.svg"
              alt=""
              aria-hidden="true"
            />
            <span className={bem(b, 'address')}>{address}</span>
          </span>
        </div>
        <span className={bem(b, 'chevron')}>
          <ChevronRightIcon />
        </span>
      </div>
    </button>
  )
})
