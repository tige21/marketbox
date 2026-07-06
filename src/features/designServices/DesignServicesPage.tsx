// ============================================================
//  DesignServicesPage — /design-services
//  Tabs = backend design-services; candidates per active service come
//  from /api/design-services/:id/candidates.
// ============================================================

import { useLayoutEffect, useRef, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { BackButton } from '@/components/BackButton'
import { BackendImage } from '@/components/BackendImage'
import { useHaptic } from '@/hooks'
import { bem, cn } from '@/utils/cn'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import type {
  BackendDesignServiceInfo,
  BackendDesignCandidate,
} from '@/api/types'
import { useDesignServices, useDesignCandidatesByService } from './hooks'
import { DesignCandidateDetailPage } from './DesignCandidateDetailPage'
import './DesignServicesPage.scss'

const b = 'design-services-page'
const bc = 'design-card'

interface DesignCardProps {
  candidate: BackendDesignCandidate
  roleLabel: string
}

function DesignCard({ candidate }: DesignCardProps) {
  const { t } = useTranslation(['designServices', 'chinaGuide', 'common'])
  const lang = useLang()
  const haptic = useHaptic()
  const navigate = useNavigate()

  const name = `${pickLocaleStr(candidate.name, lang)} ${pickLocaleStr(candidate.surname, lang)}`.trim()
  const photo = pickLocale(candidate.photo, lang)
  // Card shows only the skills (ability). Age, city, role, experience and
  // the description now live on the detail page ("Подробнее").
  const skills = pickLocaleStr(candidate.ability, lang)

  function handleDetails() {
    haptic.tap()
    navigate(`/design-services/candidates/${candidate.id}`)
  }

  return (
    <article className={bc}>
      <div className={bem(bc, 'photo-wrap')}>
        <BackendImage
          src={photo}
          alt={name}
          className={bem(bc, 'photo')}
        />
      </div>

      <div className={bem(bc, 'info')}>
        <div className={bem(bc, 'name-row')}>
          <span className={bem(bc, 'name')}>{name}</span>
          {candidate.is_verify ? (
            <img
              src="/app/images/china-guide/verified-purple.svg"
              alt=""
              aria-label={t('designServices:aria.verified')}
              className={bem(bc, 'verified')}
            />
          ) : null}
        </div>

        {skills && (
          <>
            <span className={bem(bc, 'skills-label')}>
              {t('common:person.skills', { defaultValue: 'Навыки' })}
            </span>
            <p className={bem(bc, 'skills')}>{skills}</p>
          </>
        )}
      </div>

      <button
        type="button"
        className={bem(bc, 'details-btn')}
        onClick={handleDetails}
        aria-label={t('common:actions.details', { defaultValue: 'Подробнее' }) + ' — ' + name}
      >
        {t('common:actions.details', { defaultValue: 'Подробнее' })}
      </button>
    </article>
  )
}

function DesignServicesListView() {
  const { t } = useTranslation(['designServices', 'common'])
  const lang = useLang()
  const haptic = useHaptic()

  const { data: services = [], isLoading: servicesLoading, error: servicesError } =
    useDesignServices()
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined)
  // Active tab is the user's selection if any, otherwise the first service.
  // Deriving this synchronously avoids a first-paint without `--active`,
  // which would trigger a stuck height/background transition on mount.
  const activeId = selectedId ?? services[0]?.id
  const tabBarRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const didFirstScrollRef = useRef(false)

  useLayoutEffect(() => {
    if (activeId == null) return
    const bar = tabBarRef.current
    const tab = tabRefs.current.get(activeId)
    if (!bar || !tab) return
    const target = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2
    const behavior: ScrollBehavior = didFirstScrollRef.current ? 'smooth' : 'auto'
    bar.scrollTo({ left: Math.max(0, target), behavior })
    didFirstScrollRef.current = true
  }, [activeId])

  const { data: candidates = [], isLoading: candLoading, error: candError } =
    useDesignCandidatesByService(activeId)

  function handleTabChange(id: number) {
    haptic.select()
    setSelectedId(id)
  }

  const activeService: BackendDesignServiceInfo | undefined = services.find(
    (s) => s.id === activeId,
  )
  const activeTitle = activeService
    ? pickLocaleStr(activeService.title, lang)
    : ''

  const error = servicesError ?? candError
  const isLoading = servicesLoading || (activeId != null && candLoading)

  return (
    <div className={b}>
      <BackButton block={b} to="/" />

      <h1 className={bem(b, 'title')}>{activeTitle.toUpperCase()}</h1>

      <div
        className={bem(b, 'tab-bar')}
        role="tablist"
        aria-label={t('designServices:aria.specialization')}
      >
        <div ref={tabBarRef} className={bem(b, 'tab-bar-track')}>
        {services.map((service) => {
          const label = pickLocaleStr(service.title, lang)
          return (
            <button
              key={service.id}
              ref={(el) => {
                if (el) tabRefs.current.set(service.id, el)
                else tabRefs.current.delete(service.id)
              }}
              type="button"
              role="tab"
              aria-selected={activeId === service.id}
              className={cn(
                bem(b, 'tab'),
                activeId === service.id && bem(b, 'tab', { active: true }),
              )}
              onClick={() => handleTabChange(service.id)}
            >
              <span>{label}</span>
            </button>
          )
        })}
        </div>
      </div>

      {error ? (
        <EmptyState icon="😞" title={t('common:error.generic')} />
      ) : isLoading ? (
        <div className={bem(b, 'grid')}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={404} className={bem(b, 'skeleton')} />
          ))}
        </div>
      ) : !candidates.length ? (
        <EmptyState icon="🎨" title={t('common:empty.title')} />
      ) : (
        <div className={bem(b, 'grid')}>
          {candidates.map((candidate) => (
            <DesignCard
              key={candidate.id}
              candidate={candidate}
              roleLabel={activeTitle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DesignServicesPage() {
  return (
    <Routes>
      <Route index element={<DesignServicesListView />} />
      <Route path="candidates/:id" element={<DesignCandidateDetailPage />} />
    </Routes>
  )
}
