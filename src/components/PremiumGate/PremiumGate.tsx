import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { bem, cn } from '@/utils/cn'
import { GlassButton } from '@/components/GlassButton'
import './PremiumGate.scss'

export interface PremiumGateProps {
  open: boolean
  onClose: () => void
  className?: string
}

const b = 'premium-gate'

export function PremiumGate({ open, onClose, className }: PremiumGateProps) {
  const { t } = useTranslation('common')
  const trapRef = useFocusTrap<HTMLDivElement>(open)
  const paymentBot =
    (import.meta.env['VITE_TG_BOT_PAYMENT_USERNAME'] as string | undefined) ??
    'marketbox_pay_bot'

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={bem(b, 'backdrop')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
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
              <a
                href={`https://t.me/${paymentBot}`}
                target="_blank"
                rel="noopener noreferrer"
                className={bem(b, 'upgrade-link')}
              >
                {t('premium.upgrade')}
              </a>
              <GlassButton variant="ghost" size="md" fullWidth onClick={onClose}>
                {t('premium.cancel')}
              </GlassButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
