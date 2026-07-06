import { QuickActions } from './components/QuickActions'
import { CategoryList } from './components/CategoryList'
import { HomeHeader } from './components/HomeHeader'
import { bem } from '@/utils/cn'
import './HomePage.scss'

const b = 'home-page'

export function HomePage() {
  return (
    <div className={b}>
      <div className={bem(b, 'glow')} aria-hidden="true" />

      {/* Expandable header: profile row + subscription-contest panel. */}
      <HomeHeader />

      <div className={bem(b, 'quick')}>
        <QuickActions />
      </div>

      <div className={bem(b, 'categories')}>
        <CategoryList />
      </div>
    </div>
  )
}
