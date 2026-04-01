import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { bem } from '@/utils/cn'
import './OfflineBanner.scss'

const b = 'offline-banner'

export function OfflineBanner() {
  const { t } = useTranslation('common')
  const isOnline = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          className={b}
          role="alert"
          aria-live="assertive"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <span className={bem(b, 'icon')} aria-hidden="true">
            📡
          </span>
          <span className={bem(b, 'text')}>{t('offline')}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
