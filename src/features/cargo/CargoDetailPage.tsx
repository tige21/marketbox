import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { EmptyState } from '@/components/EmptyState'
import { BackendImage, Skeleton, LessonCard } from '@/components'
import { ChevronRightIcon } from '@/components/Icons'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { pickLocale, pickLocaleStr, useLang, type Lang } from '@/api/locale'
import type {
  BackendCargo,
  BackendCargoLogistic,
  BackendCargoTeamMember,
  BackendLesson,
} from '@/api/types'
import { useLessonFavorites } from '@/features/favorites/hooks/useLessonFavorites'
import { useCargoInfo } from './hooks'
import './CargoPage.scss'

// ============================================================
// CargoDetailPage — picks one of three layouts based on what
// /api/cargo/{id}/info returns:
//  • team + contacts -> "Белое карго" (cargo-white)
//  • logistics[]    -> "Логистика" (cargo-list)
//  • fulfillment[]  -> "Фулфилмент" (cargo-fulfillment)
// ============================================================

export function CargoDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { t } = useTranslation(['cargo', 'common'])
  const lang = useLang()

  const numericId = Number(id)
  const validId = Number.isFinite(numericId) && numericId > 0 ? numericId : undefined
  const { data: info, isLoading, error } = useCargoInfo(validId)

  if (error) {
    return (
      <div className="cargo-detail">
        <GlassHeader showBack size="medium" title="" />
        <EmptyState icon="😞" title={t('common:error.generic')} />
      </div>
    )
  }

  if (isLoading || !info) {
    return (
      <div className="cargo-white">
        <GlassHeader showBack size="medium" title="" />
        <div className="cargo-white__body">
          <Skeleton variant="rect" height={274} borderRadius={20} />
          <Skeleton variant="rect" height={169} borderRadius={20} />
          <Skeleton variant="rect" height={200} borderRadius={20} />
        </div>
      </div>
    )
  }

  const { cargo, lessons, logistics, fulfillment } = info

  if (fulfillment?.length > 0) {
    return <CargoFulfillmentView cargo={cargo} items={fulfillment} lang={lang} />
  }
  if (logistics?.length > 0) {
    return <CargoLogisticsView cargo={cargo} items={logistics} lang={lang} />
  }
  return <CargoWhiteView cargo={cargo} lessons={lessons ?? []} lang={lang} />
}

// ─── View 1: Белое карго (team + lessons + contacts) ────────

interface CargoWhiteViewProps {
  cargo: BackendCargo
  lessons: BackendLesson[]
  lang: Lang
}

function CargoWhiteView({ cargo, lessons, lang }: CargoWhiteViewProps) {
  const { t } = useTranslation(['cargo', 'common'])
  const navigate = useNavigate()
  const b = 'cargo-white'
  const title = pickLocaleStr(cargo.title, lang)
  // Brand name for the About card. Falls back to title when backend
  // hasn't populated company_name yet (older cargo entries).
  const companyName = cargo.company_name ? pickLocaleStr(cargo.company_name, lang) : ''
  const preview = pickLocaleStr(cargo.preview_text, lang)
  const description = pickLocaleStr(cargo.description, lang)

  // Real backend favorites — POST/DELETE /api/user/lessons/{id}/favorite.
  // Optimistic mutation updates the cached favorites list immediately,
  // and any mounted FavoritesPage will see the change via its own
  // useLessonFavorites subscription (same query key).
  const { isFavorite, toggle, pendingId } = useLessonFavorites()

  function openLessonMaterials(lessonId: number) {
    triggerHaptic('tap')
    // Standalone lesson route — cargo lessons are flat under cargo,
    // not nested inside a Module like courses' lessons. Routing them
    // through `/courses/...` was a hack that broke after the May 2026
    // backend refactor (path now means "course id / module id").
    navigate(`/lessons/${lessonId}`)
  }

  function openContact(url?: string | null) {
    if (!url) return
    triggerHaptic('tap')
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="bold" title={title} />

      <div className={bem(b, 'body')}>
        {/* Lessons */}
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            liked={isFavorite(lesson.id)}
            onLikeToggle={() => toggle(lesson)}
            disabled={pendingId === lesson.id}
            onMaterialsClick={() => openLessonMaterials(lesson.id)}
          />
        ))}

        {/* About card */}
        <div className={bem(b, 'about')}>
          <h2 className={bem(b, 'about-name')}>{companyName || title}</h2>
          {preview && <p className={bem(b, 'about-tagline')}>{preview}</p>}
          {description && <p className={bem(b, 'about-desc')}>{description}</p>}
        </div>

        {/* Team */}
        {cargo.team?.length > 0 && (
          <section className={bem(b, 'section')}>
            <h2 className={bem(b, 'heading')}>{t('cargo:white_page.team_title')}</h2>
            <div className={bem(b, 'team-grid')}>
              {cargo.team.map((m, i) => (
                <TeamMemberCard key={i} block={b} member={m} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* Contacts */}
        {(cargo.phone || cargo.email || cargo.site) && (
          <section className={bem(b, 'section')}>
            <h2 className={bem(b, 'heading')}>{t('cargo:white_page.contacts_title')}</h2>
            <ul className={bem(b, 'contacts')}>
              {cargo.phone && (
                <li
                  className={bem(b, 'contact')}
                  onClick={() => openContact(`tel:${cargo.phone}`)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src="/app/images/cargo/phone.svg"
                    alt=""
                    className={bem(b, 'contact-icon')}
                    aria-hidden="true"
                  />
                  <span className={bem(b, 'contact-text')}>{cargo.phone}</span>
                </li>
              )}
              {cargo.email && (
                <li
                  className={bem(b, 'contact')}
                  onClick={() => openContact(`mailto:${cargo.email}`)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src="/app/images/cargo/mail.svg"
                    alt=""
                    className={bem(b, 'contact-icon')}
                    aria-hidden="true"
                  />
                  <span className={bem(b, 'contact-text')}>{cargo.email}</span>
                </li>
              )}
              {cargo.site && (
                <li
                  className={bem(b, 'contact')}
                  onClick={() => openContact(cargo.site)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src="/app/images/cargo/website.svg"
                    alt=""
                    className={bem(b, 'contact-icon', { website: true })}
                    aria-hidden="true"
                  />
                  <span className={bem(b, 'contact-text')}>{cargo.site}</span>
                </li>
              )}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

function TeamMemberCard({
  block,
  member,
  lang,
}: {
  block: string
  member: BackendCargoTeamMember
  lang: Lang
}) {
  const fio = pickLocaleStr(member.fio, lang)
  const position = pickLocaleStr(member.position, lang)
  const experience = member.experience ? pickLocaleStr(member.experience, lang) : ''
  const photo = pickLocale(member.photo, lang)
  return (
    <div className={bem(block, 'member')}>
      <div className={bem(block, 'member-avatar')}>
        {photo && (
          <BackendImage
            src={photo}
            alt={fio}
            className={bem(block, 'member-photo')}
          />
        )}
      </div>
      <p className={bem(block, 'member-name')}>{fio}</p>
      <p className={bem(block, 'member-role')}>{position}</p>
      {experience && <p className={bem(block, 'member-exp')}>{experience}</p>}
    </div>
  )
}

// ─── View 2: Логистика (vertical list of provider cards) ────

interface CargoListViewProps {
  cargo: BackendCargo
  items: BackendCargoLogistic[]
  lang: Lang
}

function CargoLogisticsView({ cargo, items, lang }: CargoListViewProps) {
  const { t } = useTranslation(['cargo', 'common'])
  const b = 'cargo-list'
  const title = pickLocaleStr(cargo.title, lang)

  return (
    <div className={b}>
      <GlassHeader showBack size="bold" title={title} />

      <div className={bem(b, 'body')}>
        {items.length === 0 ? (
          <EmptyState icon="🚢" title={t('common:empty.title')} />
        ) : (
          items.map((item) => (
            <LogisticListCard key={item.id} item={item} lang={lang} />
          ))
        )}
      </div>
    </div>
  )
}

function LogisticListCard({
  item,
  lang,
}: {
  item: BackendCargoLogistic
  lang: Lang
}) {
  const { t } = useTranslation('cargo')
  const navigate = useNavigate()
  const b = 'cargo-list'
  const name = pickLocaleStr(item.title, lang)
  const logo = pickLocale(item.image, lang)
  const countries = pickLocaleStr(item.preview_text, lang)
  const linkLabel = pickLocaleStr(item.title_url, lang) || t('list_page.details_btn')

  const handleClick = () => {
    triggerHaptic('tap')
    navigate(`/cargo/items/${item.id}`)
  }

  return (
    <article
      className={bem(b, 'card')}
      onClick={handleClick}
      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
    >
      {logo ? (
        <BackendImage src={logo} alt={name} className={bem(b, 'logo')} />
      ) : (
        <div className={bem(b, 'logo')} aria-hidden="true" />
      )}
      <div className={bem(b, 'info')}>
        <h3 className={bem(b, 'name')}>{name}</h3>
        {countries && <p className={bem(b, 'countries-label')}>{countries}</p>}
        {item.flags?.length > 0 && (
          <div className={bem(b, 'flags')} aria-hidden="true">
            {item.flags.map((flagUrl, i) => (
              <BackendImage
                key={i}
                src={flagUrl}
                alt=""
                className={bem(b, 'flag')}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          className={bem(b, 'details-btn')}
          disabled={!item.url}
          style={item.url ? { pointerEvents: 'none' } : undefined}
        >
          {linkLabel} ›
        </button>
      </div>
    </article>
  )
}

// ─── View 3: Фулфилмент (stacked provider cards, grid-ish) ──

function CargoFulfillmentView({ cargo, items, lang }: CargoListViewProps) {
  const { t } = useTranslation(['cargo', 'common'])
  const b = 'cargo-fulfillment'
  const title = pickLocaleStr(cargo.title, lang)

  return (
    <div className={b}>
      <GlassHeader showBack size="bold" title={title} />

      <div className={bem(b, 'body')}>
        {items.length === 0 ? (
          <EmptyState icon="📦" title={t('common:empty.title')} />
        ) : (
          items.map((item) => (
            <FulfillmentCard key={item.id} item={item} lang={lang} />
          ))
        )}
      </div>
    </div>
  )
}

function FulfillmentCard({
  item,
  lang,
}: {
  item: BackendCargoLogistic
  lang: Lang
}) {
  const { t } = useTranslation('cargo')
  const navigate = useNavigate()
  const b = 'cargo-fulfillment'
  const name = pickLocaleStr(item.title, lang)
  const thumb = pickLocale(item.image, lang)
  const subtitle = pickLocaleStr(item.preview_text, lang)
  const linkLabel = pickLocaleStr(item.title_url, lang) || t('list_page.details_btn')

  const handleClick = () => {
    triggerHaptic('tap')
    navigate(`/cargo/items/${item.id}`)
  }

  return (
    <article
      className={bem(b, 'card')}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {thumb ? (
        <BackendImage src={thumb} alt={name} className={bem(b, 'thumb')} />
      ) : (
        <div className={bem(b, 'thumb')} aria-hidden="true" />
      )}
      <div className={bem(b, 'info')}>
        <h3 className={bem(b, 'name')}>{name}</h3>
        {subtitle && <p className={bem(b, 'subtitle')}>{subtitle}</p>}
        {item.flags?.length > 0 && (
          <div className={bem(b, 'flags')} aria-hidden="true">
            {item.flags.map((flagUrl, i) => (
              <BackendImage
                key={i}
                src={flagUrl}
                alt=""
                className={bem(b, 'flag')}
              />
            ))}
          </div>
        )}
        {item.url && (
          <span className={bem(b, 'details-btn')}>
            <span className={bem(b, 'details-label')}>{linkLabel}</span>
            <span className={bem(b, 'details-chevron')} aria-hidden="true">
              <ChevronRightIcon width={7} height={12} />
            </span>
          </span>
        )}
      </div>
    </article>
  )
}

// ─── Icons ──────────────────────────────────────────────────

function HeartYellowIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden="true">
      <path
        d="M18.3115 1.46071C15.9773 -0.91968 13.2743 0.084255 11.6007 1.14593C10.655 1.74582 9.34498 1.74582 8.39929 1.14593C6.72564 0.0842676 4.02272 -0.919653 1.68853 1.46072C-3.85249 7.11136 5.64988 18 10 18C14.3502 18 23.8525 7.11136 18.3115 1.46071Z"
        fill="#F7FB4B"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="11" height="12" viewBox="0 0 14.4 16" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 8.8C0 11.7998 0 13.2997 0.763932 14.3511C1.01065 14.6907 1.30928 14.9893 1.64886 15.2361C2.70032 16 4.20021 16 7.2 16C10.1998 16 11.6997 16 12.7511 15.2361C13.0907 14.9893 13.3894 14.6907 13.6361 14.3511C14.4 13.2997 14.4 11.7998 14.4 8.8V7.2C14.4 6.52885 14.4 5.93277 14.3914 5.4L14.3353 5.4C13.6537 5.40006 13.2385 5.40009 12.8804 5.34337C10.9121 5.03162 9.36838 3.4879 9.05663 1.5196C8.99991 1.16146 8.99994 0.746269 9 0.0646561L9 0.0085556C8.46723 0 7.87115 0 7.2 0C4.20021 0 2.70032 0 1.64886 0.763931C1.30928 1.01065 1.01065 1.30928 0.763932 1.64886C0 2.70032 0 4.20021 0 7.2V8.8Z"
        fill="white"
      />
    </svg>
  )
}
