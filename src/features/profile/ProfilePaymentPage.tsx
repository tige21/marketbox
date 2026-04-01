import { useState } from 'react'
import { GlassHeader } from '@/components/GlassHeader'
import { triggerHaptic } from '@/utils'
import { bem, cn } from '@/utils/cn'
import './ProfileSubPage.scss'

const b = 'profile-sub'

function ChevronRightIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
      <path d="M1 1L7 7L1 13" stroke="rgba(250,250,250,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
      <path d="M1 1L7 7L13 1" stroke="rgba(250,250,250,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ProfilePaymentPage() {
  const [subscriptionOpen, setSubscriptionOpen] = useState(true)

  const handleToggle = () => {
    triggerHaptic('tap')
    setSubscriptionOpen((prev) => !prev)
  }

  const handleCancelSubscription = () => {
    triggerHaptic('tap')
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title="Платежная Информация" />
      <div className={bem(b, 'content')}>
        <div className={bem(b, 'card')}>
          <div className={cn(bem(b, 'row'), bem(b, 'row', { interactive: true }))}>
            <img
              src="/images/profile/payment.svg"
              alt=""
              aria-hidden="true"
              className={bem(b, 'row-icon')}
              loading="lazy"
              decoding="async"
            />
            <span className={bem(b, 'row-label')}>Привязанная карта</span>
            <div className={bem(b, 'row-right')}>
              <span className={bem(b, 'row-value')}>0025****</span>
              <ChevronRightIcon />
            </div>
          </div>

          <div className={bem(b, 'divider')} />

          <div
            className={cn(bem(b, 'row'), bem(b, 'row', { interactive: true }))}
            onClick={handleToggle}
            role="button"
            tabIndex={0}
            aria-expanded={subscriptionOpen}
            onKeyDown={(e) => { if (e.key === 'Enter') handleToggle() }}
          >
            <span className={bem(b, 'row-label')}>Управления подпиской</span>
            <div className={bem(b, 'row-right')}>
              <ChevronDownIcon />
            </div>
          </div>

          {subscriptionOpen && (
            <div className={bem(b, 'accordion-body')}>
              <button
                className={bem(b, 'cancel-btn')}
                onClick={handleCancelSubscription}
                type="button"
              >
                Отменить подписку
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
