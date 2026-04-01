import { useNavigate } from 'react-router-dom'
import { GlassHeader } from '@/components/GlassHeader'
import { bem, cn } from '@/utils/cn'
import './CoursesPage.scss'

const b = 'courses-catalog'

function MessageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface MarketplaceTile {
  id: string
  label: string
  fullWidth?: boolean
  imageUrl?: string
}

const TILES: MarketplaceTile[] = [
  { id: 'ozon', label: 'OZON', imageUrl: '/images/courses/ozon.jpg' },
  { id: 'wildberries', label: 'WILDBERRIES' },
  { id: 'uzum', label: 'UZUM MARKET' },
  { id: 'dropshipping', label: 'DROPSHIPPING' },
  { id: 'china', label: 'БИЗНЕС С КИТАЕМ', fullWidth: true },
]

export function CoursesCatalog() {
  const navigate = useNavigate()

  const handleTileClick = (id: string) => {
    navigate(`/courses/${id}`)
  }

  const handleChatsClick = () => {
    navigate('/courses/chats')
  }

  const gridTiles = TILES.filter(t => !t.fullWidth)
  const fullWidthTiles = TILES.filter(t => t.fullWidth)

  return (
    <div className={b}>
      <GlassHeader showBack title="КУРСЫ" />
      <div className={bem(b, 'content')}>
        <div className={bem(b, 'grid')}>
          {gridTiles.map(tile => (
            <button
              key={tile.id}
              className={bem(b, 'tile')}
              onClick={() => handleTileClick(tile.id)}
              aria-label={tile.label}
            >
              {tile.imageUrl
                ? <img src={tile.imageUrl} alt={tile.label} className={bem(b, 'tile-image')} loading="lazy" decoding="async" />
                : <div className={bem(b, 'tile-image')} aria-hidden="true" />
              }
              <span className={bem(b, 'tile-label')}>{tile.label}</span>
            </button>
          ))}
        </div>

        <div className={bem(b, 'full-row')}>
          {fullWidthTiles.map(tile => (
            <button
              key={tile.id}
              className={cn(bem(b, 'tile'), bem(b, 'tile') + '--full')}
              onClick={() => handleTileClick(tile.id)}
              aria-label={tile.label}
            >
              {tile.imageUrl
                ? <img src={tile.imageUrl} alt={tile.label} className={bem(b, 'tile-image')} loading="lazy" decoding="async" />
                : <div className={bem(b, 'tile-image')} aria-hidden="true" />
              }
              <span className={bem(b, 'tile-label')}>{tile.label}</span>
            </button>
          ))}
        </div>

        <button
          className={bem(b, 'chats-btn')}
          onClick={handleChatsClick}
        >
          <MessageIcon />
          <span>ЧАТЫ</span>
        </button>
      </div>
    </div>
  )
}
