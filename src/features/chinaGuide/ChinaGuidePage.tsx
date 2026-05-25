import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils/telegram'
import { Skeleton } from '@/components'
import { BackButton } from '@/components/BackButton'
import { BackendImage } from '@/components/BackendImage'
import { EmptyState } from '@/components/EmptyState'
import { ChevronRightIcon } from '@/components/Icons'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { useGuids } from './hooks'
import type { ChinaGuideType } from '@/api/types'
import './ChinaGuidePage.scss'

const b = 'china-guide-page'

// Backend returns /api/guids in fixed order matching frontend routes.
// Index -> frontend section type used in URL (/china-guide/{type}).
const GUID_POSITION_TO_TYPE: readonly ChinaGuideType[] = [
  'tours',
  'markets',
  'restaurants',
  'hotels',
  'translators',
]

export function ChinaGuidePage() {
  const { t } = useTranslation(['chinaGuide', 'common'])
  const navigate = useNavigate()
  const lang = useLang()
  const { data: guids = [], isLoading, error } = useGuids()

  function handleCardClick(type: ChinaGuideType | undefined) {
    if (!type) return
    triggerHaptic('tap')
    navigate(`/china-guide/${type}`)
  }

  return (
    <div className={b}>
      <BackButton block={b} to="/" ariaLabel={t('common:actions.back')} />

      <h1 className={bem(b, 'title')}>{t('chinaGuide:title')}</h1>

      <div className={bem(b, 'content')}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rect"
              height={171}
              borderRadius={20}
              width="100%"
            />
          ))
        ) : error ? (
          <EmptyState icon="😞" title={t('common:error.generic')} />
        ) : guids.length === 0 ? (
          <EmptyState icon="🧭" title={t('common:empty.title')} />
        ) : (
          guids.map((guid, index) => {
            const type = GUID_POSITION_TO_TYPE[index]
            const title = pickLocaleStr(guid.title, lang)
            const description = pickLocaleStr(guid.preview_text, lang)
            const image = pickLocale(guid.image, lang)
            const isDisabled = !type
            return (
              <button
                key={guid.id}
                type="button"
                className={bem(b, 'card', { disabled: isDisabled })}
                onClick={() => handleCardClick(type)}
                aria-disabled={isDisabled}
                aria-label={title}
              >
                <BackendImage
                  className={bem(b, 'card-image')}
                  src={image}
                  alt=""
                />
                <div className={bem(b, 'card-bar')}>
                  <span className={bem(b, 'card-name')}>{title}</span>
                  {description && (
                    <span className={bem(b, 'card-desc')}>{description}</span>
                  )}
                  <span className={bem(b, 'card-chevron')}>
                    <ChevronRightIcon />
                  </span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
