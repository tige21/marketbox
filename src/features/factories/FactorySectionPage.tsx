import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BackendImage } from '@/components/BackendImage'
import { ChevronRightIcon } from '@/components/Icons'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import {
  useFabric,
  useFabricSections,
  useFabricSectionCompanies,
} from './hooks'
import './FactoriesPage.scss'

const b = 'factory-section'

export function FactorySectionPage() {
  const { countryCode = '', sectionId = '' } = useParams<{
    countryCode: string
    sectionId: string
  }>()
  const { t } = useTranslation(['factories', 'common'])
  const lang = useLang()
  const navigate = useNavigate()

  const fabricId = Number(countryCode)
  const sectionNumId = Number(sectionId)
  const validFabricId = Number.isFinite(fabricId) ? fabricId : undefined
  const validSectionId = Number.isFinite(sectionNumId) ? sectionNumId : undefined

  const { data: fabric } = useFabric(validFabricId)
  const { data: sections = [] } = useFabricSections(validFabricId)
  const {
    data: companies = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFabricSectionCompanies(validFabricId, validSectionId)

  const country = fabric ? pickLocaleStr(fabric.title, lang) : ''
  const section = sections.find((s) => s.id === validSectionId)
  const sectionTitle = section ? pickLocaleStr(section.title, lang) : ''

  const handleCardTap = (companyId: number) => {
    triggerHaptic('tap')
    navigate(`/factories/${validFabricId}/${validSectionId}/${companyId}`)
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={country} size="bold" />

      <div className={bem(b, 'body')}>
        {isLoading ? (
          <ul className={bem(b, 'list')}>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className={bem(b, 'item')}>
                <Skeleton variant="rect" width="100%" height={114} borderRadius={20} />
              </li>
            ))}
          </ul>
        ) : error ? (
          <EmptyState
            icon="🏭"
            title={t('common:error.generic')}
            action={{
              label: t('common:error.retry'),
              onClick: () => {
                triggerHaptic('tap')
                if (!isFetching) refetch()
              },
            }}
          />
        ) : companies.length === 0 ? (
          <EmptyState icon="🏭" title={t('common:empty.title')} />
        ) : (
          <ul className={bem(b, 'list')}>
            {companies.map((c) => {
              const name = pickLocaleStr(c.title, lang)
              const image = pickLocale(c.image, lang)
              return (
                <li key={c.id} className={bem(b, 'item')}>
                  <article
                    className={bem(b, 'card')}
                    onClick={() => handleCardTap(c.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleCardTap(c.id)
                      }
                    }}
                  >
                    <div className={bem(b, 'card-thumb')}>
                      <BackendImage
                        src={image}
                        alt={name}
                        className={bem(b, 'card-thumb-img')}
                      />
                    </div>

                    <div className={bem(b, 'card-info')}>
                      <h3 className={bem(b, 'card-name')}>{name}</h3>
                      {sectionTitle && (
                        <span className={bem(b, 'card-subtitle')}>
                          {sectionTitle}
                        </span>
                      )}
                      <button
                        type="button"
                        className={bem(b, 'card-cta')}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCardTap(c.id)
                        }}
                      >
                        <span>{t('common:actions.details', { defaultValue: 'Подробнее' })}</span>
                        <ChevronRightIcon />
                      </button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
