import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { GlassHeader } from '@/components/GlassHeader'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { jobsApi } from '@/api/endpoints'
import { useHaptic } from '@/hooks'
import { bem, cn } from '@/utils/cn'
import type { Job, JobType } from '@/api/types'
import './JobsPage.scss'

type JobFilter = JobType

interface FilterTab {
  key: JobFilter
  label: string
}

const FILTERS: FilterTab[] = [
  { key: 'full-time', label: 'Вакансия' },
  { key: 'part-time', label: 'Оптом' },
  { key: 'freelance', label: 'Услуги' },
]

const b = 'jobs-page'
const bc = 'job-card'

function LocationIcon() {
  return (
    <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
      <path d="M4 0C1.79 0 0 1.79 0 4C0 7 4 10 4 10C4 10 8 7 8 4C8 1.79 6.21 0 4 0ZM4 5.5C3.17 5.5 2.5 4.83 2.5 4C2.5 3.17 3.17 2.5 4 2.5C4.83 2.5 5.5 3.17 5.5 4C5.5 4.83 4.83 5.5 4 5.5Z" fill="currentColor" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="5" cy="5" rx="2" ry="4.5" stroke="currentColor" strokeWidth="1" />
      <line x1="0.5" y1="5" x2="9.5" y2="5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
      <rect x="0.5" y="0.5" width="11" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
      <line x1="4" y1="9.5" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="6" y1="7.5" x2="6" y2="9.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function VerifiedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="#2AABEE" />
      <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface JobCardProps {
  job: Job
}

function JobCard({ job }: JobCardProps) {
  const haptic = useHaptic()

  function handleContact() {
    haptic.tap()
    const handle = job.telegram.replace('@', '')
    window.open(`https://t.me/${handle}`, '_blank')
  }

  return (
    <article className={bc}>
      <div className={bem(bc, 'photo-wrap')}>
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={job.companyName}
            className={bem(bc, 'photo')}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={bem(bc, 'photo-placeholder')}>
            <span className={bem(bc, 'photo-initial')}>
              {job.companyName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className={bem(bc, 'info')}>
        <div className={bem(bc, 'name-row')}>
          <span className={bem(bc, 'name')}>{job.companyName}</span>
          {job.isVerified && (
            <span className={bem(bc, 'verified')} aria-label="Проверено">
              <VerifiedIcon />
            </span>
          )}
        </div>

        <span className={bem(bc, 'salary')}>{job.salary} {job.currency}</span>

        <div className={bem(bc, 'meta-row')}>
          <span className={bem(bc, 'meta-icon')}><LocationIcon /></span>
          <span className={bem(bc, 'meta-text')}>{job.location}</span>
        </div>

        <div className={bem(bc, 'meta-row')}>
          <span className={bem(bc, 'meta-icon')}><GlobeIcon /></span>
          <span className={bem(bc, 'meta-text')}>{job.categories[0]}</span>
        </div>

        <div className={bem(bc, 'meta-row', { dim: true })}>
          <span className={bem(bc, 'meta-icon', { dim: true })}><MonitorIcon /></span>
          <span className={bem(bc, 'meta-text', { dim: true })}>{job.requirements[0]}</span>
        </div>

        <p className={bem(bc, 'description')}>{job.description}</p>

        <button
          type="button"
          className={bem(bc, 'contact-btn')}
          onClick={handleContact}
          aria-label={`Связаться — ${job.companyName}`}
        >
          Получить Контакт
        </button>
      </div>
    </article>
  )
}

export function JobsPage() {
  const { t } = useTranslation('common')
  const haptic = useHaptic()
  const [activeFilter, setActiveFilter] = useState<JobFilter>('full-time')

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.getList().then(res => res.data.data),
  })

  const filtered = data?.filter(job => job.type === activeFilter) ?? []

  function handleFilterChange(filter: JobFilter) {
    haptic.select()
    setActiveFilter(filter)
  }

  if (error) {
    return <EmptyState icon="😞" title={t('error.generic')} />
  }

  const activeLabel = FILTERS.find(f => f.key === activeFilter)?.label ?? ''

  return (
    <div className={b}>
      <GlassHeader showBack title={activeLabel.toUpperCase()} />

      <div className={bem(b, 'content')}>
        <div className={bem(b, 'filter-bar')} role="tablist" aria-label="Фильтр вакансий">
          {FILTERS.map(tab => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeFilter === tab.key}
              className={cn(
                bem(b, 'filter-tab'),
                activeFilter === tab.key && bem(b, 'filter-tab', { active: true })
              )}
              onClick={() => handleFilterChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={bem(b, 'grid')}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rect" height={404} className={bem(b, 'skeleton')} />
            ))}
          </div>
        ) : !filtered.length ? (
          <EmptyState icon="💼" title={t('empty.title')} />
        ) : (
          <div className={bem(b, 'grid')}>
            {filtered.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
