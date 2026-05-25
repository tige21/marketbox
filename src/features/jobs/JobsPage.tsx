// ============================================================
//  JobsPage — /jobs
//  Pixel-perfect to Figma node 1048:13050 (file l1EkS5BshNwcL2Zjqku2Av)
//  Tabs are the backend `works` list (up to 3 visible); each tab loads
//  its own candidates via /api/works/:id/candidates.
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
import type { BackendWork, BackendWorkCandidate } from '@/api/types'
import { useWorks, useWorkCandidates } from './hooks'
import { CandidateDetailPage } from './CandidateDetailPage'
import './JobsPage.scss'

const b = 'jobs-page'
const bc = 'job-card'

interface JobCardProps {
  candidate: BackendWorkCandidate
}

function JobCard({ candidate }: JobCardProps) {
  const { t } = useTranslation(['chinaGuide', 'designServices', 'common'])
  const lang = useLang()
  const haptic = useHaptic()
  const navigate = useNavigate()

  const name = `${pickLocaleStr(candidate.name, lang)} ${pickLocaleStr(candidate.surname, lang)}`.trim()
  const photo = pickLocale(candidate.photo, lang)
  const city = pickLocaleStr(candidate.address, lang)
  const specialization = pickLocaleStr(candidate.ability, lang)
  const experience = pickLocaleStr(candidate.experience, lang)
  const description = pickLocaleStr(candidate.preview_text, lang)
  const contactUrl = candidate.url

  function handleContact() {
    haptic.tap()
    if (contactUrl) window.open(contactUrl, '_blank', 'noopener,noreferrer')
  }

  function handleDetails() {
    haptic.tap()
    navigate(`/jobs/candidates/${candidate.id}`)
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

        <span className={bem(bc, 'age')}>{candidate.age} {t('designServices:age_suffix')}</span>

        <div className={bem(bc, 'meta-row')}>
          <img src="/app/images/documents/location.svg" alt="" className={bem(bc, 'meta-icon')} />
          <span className={bem(bc, 'meta-text')}>{city}</span>
        </div>

        <div className={bem(bc, 'meta-row')}>
          <img src="/app/images/documents/website.svg" alt="" className={bem(bc, 'meta-icon')} />
          <span className={bem(bc, 'meta-text')}>{specialization}</span>
        </div>

        <div className={bem(bc, 'meta-row')}>
          <img src="/app/images/documents/display.svg" alt="" className={bem(bc, 'meta-icon', { dim: true })} />
          <span className={bem(bc, 'meta-text')}>{experience}</span>
        </div>
      </div>

      <p className={bem(bc, 'description')}>{description}</p>

      <button
        type="button"
        className={bem(bc, 'details-btn')}
        onClick={handleDetails}
        aria-label={t('common:actions.details', { defaultValue: 'Подробнее' }) + ' — ' + name}
      >
        {t('common:actions.details', { defaultValue: 'Подробнее' })}
      </button>

      <button
        type="button"
        className={bem(bc, 'contact-btn')}
        onClick={handleContact}
        aria-label={t('chinaGuide:list.contact_btn') + ' — ' + name}
      >
        {t('chinaGuide:list.contact_btn')}
      </button>
    </article>
  )
}

/**
 * Parse a work title like "Менеджер WILDBERRIES" into { role, brand }
 * so the tab label stays in the 2-line "Role / BRAND" pattern.
 * Falls back to the full title in "role" if no uppercase token is found.
 */
function splitWorkTitle(work: BackendWork, lang: 'ru' | 'uz'): { role: string; brand: string } {
  const full = pickLocaleStr(work.title, lang)
  const match = full.match(/^(.*?)\s+([A-ZА-ЯЁ][A-ZА-ЯЁ0-9\s]+)$/)
  if (match && match[1] && match[2]) {
    return { role: match[1].trim(), brand: match[2].trim() }
  }
  return { role: full, brand: '' }
}

function JobsListView() {
  const { t } = useTranslation(['common', 'jobs'])
  const lang = useLang()
  const haptic = useHaptic()

  const { data: works = [], isLoading: worksLoading, error: worksError } = useWorks()
  const [selectedWorkId, setSelectedWorkId] = useState<number | undefined>(undefined)
  // Active tab = user's selection or first work; synchronous default
  // prevents a first-paint transition flicker on initial entry.
  const activeWorkId = selectedWorkId ?? works[0]?.id
  const tabBarRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const didFirstScrollRef = useRef(false)

  useLayoutEffect(() => {
    if (activeWorkId == null) return
    const bar = tabBarRef.current
    const tab = tabRefs.current.get(activeWorkId)
    if (!bar || !tab) return
    const target = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2
    const behavior: ScrollBehavior = didFirstScrollRef.current ? 'smooth' : 'auto'
    bar.scrollTo({ left: Math.max(0, target), behavior })
    didFirstScrollRef.current = true
  }, [activeWorkId])

  const { data: candidates = [], isLoading: candLoading, error: candError } =
    useWorkCandidates(activeWorkId)

  function handleTabChange(workId: number) {
    haptic.select()
    setSelectedWorkId(workId)
  }

  const visibleWorks = works
  const error = worksError ?? candError
  const isLoading = worksLoading || (activeWorkId != null && candLoading)

  return (
    <div className={b}>
      <BackButton block={b} to="/" />

      <h1 className={bem(b, 'title')}>{t('jobs:title')}</h1>

      <div
        className={bem(b, 'tab-bar')}
        role="tablist"
        aria-label={t('jobs:aria.marketplace')}
      >
        <div ref={tabBarRef} className={bem(b, 'tab-bar-track')}>
        {visibleWorks.map(work => {
          const { role, brand } = splitWorkTitle(work, lang)
          return (
            <button
              key={work.id}
              ref={(el) => {
                if (el) tabRefs.current.set(work.id, el)
                else tabRefs.current.delete(work.id)
              }}
              type="button"
              role="tab"
              aria-selected={activeWorkId === work.id}
              className={cn(
                bem(b, 'tab'),
                activeWorkId === work.id && bem(b, 'tab', { active: true })
              )}
              onClick={() => handleTabChange(work.id)}
            >
              <span>{role || t('jobs:tab_role_manager')}</span>
              {brand && <span>{brand}</span>}
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
        <EmptyState icon="💼" title={t('common:empty.title')} />
      ) : (
        <div className={bem(b, 'grid')}>
          {candidates.map(candidate => (
            <JobCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  )
}

export function JobsPage() {
  return (
    <Routes>
      <Route index element={<JobsListView />} />
      <Route path="candidates/:id" element={<CandidateDetailPage />} />
    </Routes>
  )
}
