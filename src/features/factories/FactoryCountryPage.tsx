import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BackendImage } from '@/components/BackendImage'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { useFabric, useFabricSections } from './hooks'
import './FactoriesPage.scss'

const b = 'factory-country'

export function FactoryCountryPage() {
  const { countryCode = '' } = useParams<{ countryCode: string }>()
  const { t } = useTranslation(['factories', 'common'])
  const lang = useLang()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const fabricId = Number(countryCode)
  const { data: fabric, isLoading: fabricLoading, error: fabricError } = useFabric(
    Number.isFinite(fabricId) ? fabricId : undefined,
  )
  const {
    data: sections = [],
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useFabricSections(fabric?.id)

  const title = fabric ? pickLocaleStr(fabric.title, lang) : ''
  const error = fabricError ?? sectionsError
  const isLoading = fabricLoading || sectionsLoading

  const filtered = query.trim()
    ? sections.filter((s) =>
        pickLocaleStr(s.title, lang).toLowerCase().includes(query.trim().toLowerCase()),
      )
    : sections

  function handleCategoryTap(sectionId: number) {
    if (!fabric) return
    triggerHaptic('tap')
    navigate(`/factories/${fabric.id}/${sectionId}`)
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={title} size="bold" />

      <div className={bem(b, 'body')}>
        <h2 className={bem(b, 'subtitle')}>{t('factories:categories_heading')}</h2>

        <div className={bem(b, 'search-wrap')}>
          <input
            className={bem(b, 'search')}
            type="search"
            placeholder={t('factories:search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('factories:search_placeholder')}
          />
          <span className={bem(b, 'search-icon')} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        {isLoading ? (
          <ul className={bem(b, 'list')}>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className={bem(b, 'item')}>
                <Skeleton variant="rect" width="100%" height={180} borderRadius={20} />
              </li>
            ))}
          </ul>
        ) : error ? (
          <EmptyState icon="🏭" title={t('common:error.generic')} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🏭" title={t('common:empty.title')} />
        ) : (
          <ul className={bem(b, 'list')}>
            {filtered.map((section) => {
              const name = pickLocaleStr(section.title, lang)
              const image = pickLocale(section.image, lang)
              return (
                <li key={section.id} className={bem(b, 'item')}>
                  <button
                    className={bem(b, 'card')}
                    onClick={() => handleCategoryTap(section.id)}
                    type="button"
                  >
                    <BackendImage
                      src={image}
                      alt={name}
                      className={bem(b, 'card-img')}
                    />
                    <div className={bem(b, 'card-bar')}>
                      <span className={bem(b, 'card-name')}>{name}</span>
                      <span className={bem(b, 'card-chevron')} aria-hidden="true">›</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
