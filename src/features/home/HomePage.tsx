import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/Avatar'
import { QuickActions } from './components/QuickActions'
import { CategoryList } from './components/CategoryList'
import { bem } from '@/utils/cn'
import './HomePage.scss'

const b = 'home-page'

function formatExpiry(isoDate: string): string {
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `до ${day}.${month}.${year}`
}

export function HomePage() {
  const { t } = useTranslation('home')
  const navigate = useNavigate()
  const { user, isPremium, subscriptionExpiry } = useAuthStore()

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ')
    : 'BORIGA BARAKA'

  return (
    <div className={b}>
      {/* Glass header card */}
      <motion.div
        className={bem(b, 'header')}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Avatar src={user?.photoUrl} name={user?.firstName} size="lg" />
        <div className={bem(b, 'header-info')}>
          <span className={bem(b, 'header-name')}>{displayName}</span>
          {isPremium && (
            <div className={bem(b, 'header-meta')}>
              <span className={bem(b, 'premium-badge')}>
                <span aria-hidden="true">★</span>
                {' PREMIUM'}
              </span>
              {subscriptionExpiry && (
                <span className={bem(b, 'expiry')}>{formatExpiry(subscriptionExpiry)}</span>
              )}
            </div>
          )}
        </div>
        <button
          className={bem(b, 'header-nav')}
          onClick={() => navigate('/profile')}
          aria-label={t('go_to_profile')}
        >
          <span aria-hidden="true">›</span>
        </button>
      </motion.div>

      {/* Quick action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.2 }}
      >
        <QuickActions />
      </motion.div>

      {/* Category cards list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.14, duration: 0.25 }}
      >
        <CategoryList />
      </motion.div>
    </div>
  )
}
