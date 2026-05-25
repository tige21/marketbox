import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { bem, cn } from '@/utils/cn'
import { GlassButton } from '@/components/GlassButton'
import { triggerHaptic, closeMiniApp } from '@/utils'
import './PremiumGate.scss'

export interface PremiumGateProps {
  /** Whether the gate is rendered. Stays open until the parent observes
   * `isPremium === true`; there is no user-facing way to dismiss it. */
  open: boolean
  /** Called when the user taps "Я оплатил" — parent should re-check
   * subscription state (typically by re-running the auth handshake). */
  onRefresh: () => void
  className?: string
}

const b = 'premium-gate'

export function PremiumGate({ open, onRefresh, className }: PremiumGateProps) {
  const { t } = useTranslation('common')
  const trapRef = useFocusTrap<HTMLDivElement>(open)
  const [refreshing, setRefreshing] = useState(false)

  const handleUpgrade = () => {
    triggerHaptic('tap')
    closeMiniApp()
  }

  const handleRefresh = () => {
    if (refreshing) return
    triggerHaptic('tap')
    setRefreshing(true)
    onRefresh()
    // Re-enable the button after the handshake has had time to land.
    // If `open` flips to false (subscription became active), the gate
    // unmounts and this timer is harmless.
    window.setTimeout(() => setRefreshing(false), 2500)
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop has NO click handler — gate is non-dismissable. */}
          <motion.div
            className={bem(b, 'backdrop')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
          {/* Centering wrapper — framer-motion sets inline `transform`
              on the dialog, so we can't rely on translateY(-50%) for
              centering. Flex on a fixed-inset parent does the job. */}
          <div className={bem(b, 'wrap')}>
          <motion.div
            ref={trapRef}
            className={cn(b, className)}
            role="dialog"
            aria-modal="true"
            aria-label={t('premium.title')}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className={bem(b, 'icon')} aria-hidden="true">
              ⭐
            </div>
            <h2 className={bem(b, 'title')}>{t('premium.title')}</h2>
            <p className={bem(b, 'description')}>{t('premium.description')}</p>
            <div className={bem(b, 'actions')}>
              <button
                type="button"
                className={bem(b, 'upgrade-link')}
                onClick={handleUpgrade}
              >
                {t('premium.upgrade')}
              </button>
              <GlassButton
                variant="ghost"
                size="md"
                fullWidth
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing
                  ? t('premium.refresh_checking')
                  : t('premium.refresh')}
              </GlassButton>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
