import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import { useUiStore } from '@/stores/uiStore'
import type { Lang } from '@/api/locale'
import './ProfileSubPage.scss'

const b = 'profile-sub'

const LANGS: readonly Lang[] = ['ru', 'uz'] as const

export function ProfileLanguagePage() {
  const { t, i18n } = useTranslation('profile')
  const setStoreLanguage = useUiStore((s) => s.setLanguage)
  const current: Lang = i18n.language === 'uz' ? 'uz' : 'ru'
  const [open, setOpen] = useState(false)

  const toggle = () => {
    triggerHaptic('tap')
    setOpen((v) => !v)
  }

  const choose = (lang: Lang) => {
    triggerHaptic('select')
    if (lang !== current) {
      void i18n.changeLanguage(lang)
      setStoreLanguage(lang)
    }
    setOpen(false)
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title={t('settings.language')} />
      <div className={bem(b, 'content')}>
        <span className={bem(b, 'section-label')}>{t('edit')}</span>
        <div className={bem(b, 'card')}>
          <button
            type="button"
            className={bem(b, 'row') + ' ' + bem(b, 'row', { interactive: true })}
            onClick={toggle}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span className={bem(b, 'row-label')}>{t('settings.language')}</span>
            <div className={bem(b, 'row-right')}>
              <span className={bem(b, 'row-value')}>
                {t(`language_values.${current}`)}
              </span>
              <span
                className={bem(b, 'row-chevron', { open })}
                aria-hidden="true"
              >
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </button>
          {open && (
            <ul className={bem(b, 'dropdown')} role="listbox">
              {LANGS.filter((l) => l !== current).map((lang) => (
                <li key={lang} className={bem(b, 'dropdown-item')}>
                  <button
                    type="button"
                    className={bem(b, 'dropdown-btn')}
                    onClick={() => choose(lang)}
                    role="option"
                    aria-selected={false}
                  >
                    {t(`language_values.${lang}`)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
