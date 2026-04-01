import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './FactoriesPage.scss'

const b = 'factory-country'

interface CategoryItem {
  name: string
  imageUrl: string
}

const COUNTRY_CATEGORIES: Record<string, CategoryItem[]> = {
  china: [
    { name: 'Электроника и бытовая техника', imageUrl: '/images/factories/china-electronics.jpg' },
    { name: 'Текстиль и одежда',             imageUrl: '/images/factories/china-textile.jpg' },
    { name: 'Обувь',                         imageUrl: '/images/factories/china-shoes.jpg' },
    { name: 'Упаковка',                      imageUrl: '/images/factories/china-packaging.jpg' },
    { name: 'Игрушки и товары для детей',    imageUrl: '/images/factories/china-toys.jpg' },
    { name: 'Бытовая Химия',                 imageUrl: '/images/factories/china-chemicals.jpg' },
  ],
  uzbekistan: [
    { name: 'Текстиль и одежда', imageUrl: '/images/factories/china-textile.jpg' },
    { name: 'Электроника',       imageUrl: '/images/factories/china-electronics.jpg' },
    { name: 'Обувь',             imageUrl: '/images/factories/china-shoes.jpg' },
  ],
  russia: [
    { name: 'Электроника', imageUrl: '/images/factories/china-electronics.jpg' },
    { name: 'Упаковка',    imageUrl: '/images/factories/china-packaging.jpg' },
    { name: 'Химия',       imageUrl: '/images/factories/china-chemicals.jpg' },
  ],
  kyrgyzstan: [
    { name: 'Текстиль и одежда', imageUrl: '/images/factories/china-textile.jpg' },
    { name: 'Обувь',             imageUrl: '/images/factories/china-shoes.jpg' },
  ],
}

const COUNTRY_NAMES: Record<string, string> = {
  china:      'factories:country.china',
  uzbekistan: 'factories:country.uzbekistan',
  russia:     'factories:country.russia',
  kyrgyzstan: 'factories:country.kyrgyzstan',
}

export function FactoryCountryPage() {
  const { countryCode = '' } = useParams<{ countryCode: string }>()
  const { t } = useTranslation(['factories', 'common'])
  const [query, setQuery] = useState('')

  const titleKey = COUNTRY_NAMES[countryCode]
  const title = titleKey ? t(titleKey) : countryCode.toUpperCase()
  const allCategories = COUNTRY_CATEGORIES[countryCode] ?? []

  const categories = query.trim()
    ? allCategories.filter(c =>
        c.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : allCategories

  function handleCategoryTap(name: string) {
    triggerHaptic('tap')
    // placeholder — no real navigation yet
    void name
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={title} size="large" />

      <div className={bem(b, 'body')}>
        <h2 className={bem(b, 'subtitle')}>{t('factories:categories_heading')}</h2>

        <div className={bem(b, 'search-wrap')}>
          <input
            className={bem(b, 'search')}
            type="search"
            placeholder={t('factories:search_placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label={t('factories:search_placeholder')}
          />
          <span className={bem(b, 'search-icon')} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </div>

        <ul className={bem(b, 'list')}>
          {categories.map(category => (
            <li key={category.name} className={bem(b, 'item')}>
              <button
                className={bem(b, 'card')}
                onClick={() => handleCategoryTap(category.name)}
                type="button"
              >
                <img
                  className={bem(b, 'card-img')}
                  src={category.imageUrl}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                />
                <div className={bem(b, 'card-bar')}>
                  <span className={bem(b, 'card-name')}>{category.name}</span>
                  <span className={bem(b, 'card-chevron')} aria-hidden="true">›</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
