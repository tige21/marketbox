import { bem } from '@/utils/cn'
import type { WholesaleSeller } from '@/api/types'
import './MarketCard.scss'

const b = 'market-card'

interface MarketCardProps {
  seller: WholesaleSeller
  onClick?: () => void
}

function LocationIcon() {
  return (
    <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 0C1.79 0 0 1.79 0 4C0 7 4 10 4 10C4 10 8 7 8 4C8 1.79 6.21 0 4 0ZM4 5.5C3.17 5.5 2.5 4.83 2.5 4C2.5 3.17 3.17 2.5 4 2.5C4.83 2.5 5.5 3.17 5.5 4C5.5 4.83 4.83 5.5 4 5.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 1L6 6L1 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MarketCard({ seller, onClick }: MarketCardProps) {
  return (
    <button type="button" className={b} onClick={onClick} aria-label={seller.name}>
      <img
        className={bem(b, 'image')}
        src={seller.imageUrl}
        alt={seller.name}
        loading="lazy"
      />
      <div className={bem(b, 'info-bar')}>
        <div className={bem(b, 'info-content')}>
          <span className={bem(b, 'name')}>{seller.name}</span>
          <div className={bem(b, 'address-row')}>
            <span className={bem(b, 'location-icon')}>
              <LocationIcon />
            </span>
            <span className={bem(b, 'address')}>{seller.address}</span>
          </div>
        </div>
        <span className={bem(b, 'chevron')}>
          <ChevronRightIcon />
        </span>
      </div>
    </button>
  )
}
