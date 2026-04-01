import { type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { bem, cn } from '@/utils/cn'
import { useHaptic } from '@/hooks/useHaptic'
import './GlassTabBar.scss'

export interface TabItem {
  id: string
  path: string
  labelKey: string
  icon: ReactNode
  activeIcon?: ReactNode
}

export interface GlassTabBarProps {
  tabs: TabItem[]
  className?: string
}

const b = 'tab-bar'

export function GlassTabBar({ tabs, className }: GlassTabBarProps) {
  const { t } = useTranslation('common')
  const location = useLocation()
  const navigate = useNavigate()
  const haptic = useHaptic()

  const handleTabClick = (path: string) => {
    haptic.select()
    navigate(path)
  }

  return (
    <nav
      className={cn(b, className)}
      role="navigation"
      aria-label={t('tabs.nav_label')}
    >
      <ul className={bem(b, 'list')}>
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path !== '/' && location.pathname.startsWith(tab.path))

          return (
            <li key={tab.id} className={bem(b, 'item')}>
              <button
                className={bem(b, 'btn', { active: isActive })}
                onClick={() => handleTabClick(tab.path)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={bem(b, 'icon')} aria-hidden="true">
                  {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
                </span>
                <span className={bem(b, 'label')}>
                  {t(`tabs.${tab.labelKey}`)}
                </span>
                {isActive && (
                  <motion.span
                    className={bem(b, 'indicator')}
                    layoutId="tab-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
