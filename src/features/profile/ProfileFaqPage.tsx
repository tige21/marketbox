import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { bem, cn } from '@/utils/cn'
import { triggerHaptic, openTelegramLink } from '@/utils'
import './ProfileSubPage.scss'
import './ProfileFaqPage.scss'

const b = 'profile-faq'

const SUPPORT_URL = 'https://t.me/cashyou_help'

interface FaqItem {
  q: string
  a: string
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="8"
      viewBox="0 0 14 8"
      fill="none"
      aria-hidden="true"
      className={cn(bem(b, 'chevron'), open && bem(b, 'chevron', { open: true }))}
    >
      <path
        d="M1 1L7 7L13 1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProfileFaqPage() {
  const { t } = useTranslation('profile')
  const items = (t('faq.items', { returnObjects: true }) as FaqItem[] | undefined) ?? []
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const handleToggle = (i: number) => {
    triggerHaptic('select')
    setOpenIndex((current) => (current === i ? null : i))
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={t('pages.faq_title')} />

      <div className={bem(b, 'content')}>
        <p className={bem(b, 'subtitle')}>{t('faq.subtitle')}</p>

        <div className={bem(b, 'list')}>
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={cn(bem(b, 'item'), isOpen && bem(b, 'item', { open: true }))}
              >
                <button
                  type="button"
                  className={bem(b, 'header')}
                  onClick={() => handleToggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className={bem(b, 'badge')}>{i + 1}</span>
                  <span className={bem(b, 'question')}>{item.q}</span>
                  <ChevronIcon open={isOpen} />
                </button>

                <div className={bem(b, 'body', { open: isOpen })}>
                  <div className={bem(b, 'body-inner')}>
                    <p className={bem(b, 'answer')}>{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Direct line to support — redirects to the Telegram help account. */}
        <button
          type="button"
          className={bem(b, 'support-btn')}
          onClick={() => {
            triggerHaptic('tap')
            openTelegramLink(SUPPORT_URL)
          }}
        >
          {t('faq.support_button', { defaultValue: 'Написать в поддержку' })}
        </button>
      </div>
    </div>
  )
}
