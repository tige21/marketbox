import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { bem } from '@/utils/cn'
import { useHaptic } from '@/hooks'
import './QuickActions.scss'

interface QuickAction {
  id: string
  emoji: string
  labelKey: string
  route: string
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'news', emoji: '📰', labelKey: 'quick_news', route: '/news' },
  { id: 'exchange', emoji: '💱', labelKey: 'quick_exchange', route: '/exchange' },
  { id: 'refer', emoji: '👥', labelKey: 'quick_refer', route: '#' },
]

const b = 'quick-actions'

export function QuickActions() {
  const { t } = useTranslation('home')
  const navigate = useNavigate()
  const haptic = useHaptic()

  const handleClick = (route: string) => {
    haptic.tap()
    if (route !== '#') navigate(route)
  }

  return (
    <div className={b}>
      {QUICK_ACTIONS.map((action, i) => (
        <motion.button
          key={action.id}
          className={bem(b, 'item')}
          onClick={() => handleClick(action.route)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 30 }}
          whileTap={{ scale: 0.94 }}
        >
          <span className={bem(b, 'emoji')} aria-hidden="true">{action.emoji}</span>
          <span className={bem(b, 'label')}>{t(action.labelKey)}</span>
        </motion.button>
      ))}
    </div>
  )
}
