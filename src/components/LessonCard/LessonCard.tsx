import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackendImage } from '@/components/BackendImage'
import { pickLocale, pickLocaleStr, useLang, type Localized } from '@/api/locale'
import { triggerHaptic } from '@/utils'
import { bem, cn } from '@/utils/cn'
import './LessonCard.scss'

const b = 'lesson-card'

// ── Minimal lesson shape supported by the card ───────────────────────────
// Both BackendLesson and BackendCourseLesson satisfy this; extra fields are
// ignored. We intentionally don't import either type so the component stays
// reusable across feature boundaries.
export interface LessonCardLesson {
  id: number | string
  title: Localized
  image: Localized | null | undefined
  video_url?: string | null
  embed_html?: string | null
}

interface LessonCardProps {
  lesson: LessonCardLesson
  /** Adds a "Урок N" prefix to the title. Used in courses, hidden in cargo/favorites. */
  number?: number
  liked?: boolean
  onLikeToggle?: () => void
  /** Called when "Материалы к уроку" is tapped. Hidden if not provided. */
  onMaterialsClick?: () => void
  /** Visual loading/disabled state for like (e.g. favorites optimistic remove). */
  disabled?: boolean
  /** Wraps the card (e.g. <motion.div> from framer-motion). Defaults to <div>. */
  Container?: (props: { className: string; children: ReactNode }) => ReactNode
}

function PlayIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="28" fill="rgba(0,0,0,0.55)" />
      <circle cx="28" cy="28" r="27" stroke="rgba(255,255,255,0.85)" strokeWidth="1" />
      <path d="M22 18L40 28L22 38V18Z" fill="white" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 14.4 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 8.8C0 11.7998 0 13.2997 0.763932 14.3511C1.01065 14.6907 1.30928 14.9893 1.64886 15.2361C2.70032 16 4.20021 16 7.2 16C10.1998 16 11.6997 16 12.7511 15.2361C13.0907 14.9893 13.3894 14.6907 13.6361 14.3511C14.4 13.2997 14.4 11.7998 14.4 8.8V7.2C14.4 6.52885 14.4 5.93277 14.3914 5.4L14.3353 5.4C13.6537 5.40006 13.2385 5.40009 12.8804 5.34337C10.9121 5.03162 9.36838 3.4879 9.05663 1.5196C8.99991 1.16146 8.99994 0.746269 9 0.0646561L9 0.0085556C8.46723 0 7.87115 0 7.2 0C4.20021 0 2.70032 0 1.64886 0.763931C1.30928 1.01065 1.01065 1.30928 0.763932 1.64886C0 2.70032 0 4.20021 0 7.2V8.8ZM7.8 5.6C7.8 5.26863 7.53137 5 7.2 5C6.86863 5 6.6 5.26863 6.6 5.6V11.149C6.58863 11.1401 6.57703 11.1309 6.56519 11.1214C6.30709 10.9141 6.00026 10.6059 5.54443 10.1459L4.42615 9.01763C4.19289 8.78228 3.81299 8.78058 3.57763 9.01385C3.34228 9.24711 3.34058 9.62701 3.57385 9.86237L4.71651 11.0153C5.14162 11.4442 5.49618 11.802 5.81379 12.057C6.14693 12.3246 6.49705 12.5281 6.9236 12.5825C7.10713 12.6058 7.29287 12.6058 7.4764 12.5825C7.90295 12.5281 8.25307 12.3246 8.58621 12.057C8.90381 11.802 9.25835 11.4442 9.68345 11.0153L10.8262 9.86237C11.0594 9.62701 11.0577 9.24711 10.8224 9.01385C10.587 8.78058 10.2071 8.78228 9.97385 9.01763L8.85557 10.1459C8.39974 10.6059 8.09291 10.9141 7.83481 11.1214C7.82297 11.1309 7.81137 11.1401 7.8 11.149V5.6Z"
        fill="white"
      />
      <path
        d="M13.0681 4.15814C13.3148 4.19722 13.6195 4.19989 14.3477 4.2C14.2722 3.0483 14.0875 2.27027 13.6361 1.64886C13.3894 1.30928 13.0907 1.01065 12.7511 0.763931C12.1297 0.312453 11.3517 0.127795 10.2 0.052269C10.2001 0.78054 10.2028 1.08516 10.2419 1.33188C10.4723 2.78671 11.6133 3.92772 13.0681 4.15814Z"
        fill="white"
      />
    </svg>
  )
}

function HeartSvg({ filled }: { filled: boolean }) {
  return (
    <svg
      width="22"
      height="20"
      viewBox="-1 -1 22 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18.3115 1.46071C15.9773 -0.91968 13.2743 0.084255 11.6007 1.14593C10.655 1.74582 9.34498 1.74582 8.39929 1.14593C6.72564 0.0842676 4.02272 -0.919653 1.68853 1.46072C-3.85249 7.11136 5.64988 18 10 18C14.3502 18 23.8525 7.11136 18.3115 1.46071Z"
        fill={filled ? '#F7FB4B' : 'none'}
        stroke={filled ? '#F7FB4B' : '#9a9a9a'}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function extractKinescopeId(url: string): string | null {
  const m = url.match(/kinescope\.io\/(?:embed\/)?([A-Za-z0-9]+)/)
  return m?.[1] ?? null
}

export function LessonCard({
  lesson,
  number,
  liked = false,
  onLikeToggle,
  onMaterialsClick,
  disabled = false,
  Container,
}: LessonCardProps) {
  const { t } = useTranslation('courses')
  const lang = useLang()

  const title = pickLocaleStr(lesson.title, lang)
  const thumbnail = pickLocale(lesson.image, lang)
  const videoUrl = lesson.video_url ?? ''
  const kinescopeId = videoUrl ? extractKinescopeId(videoUrl) : null
  const embedSrc = kinescopeId ? `https://kinescope.io/embed/${kinescopeId}?autoplay=1` : null
  const hasVideo = !!embedSrc || !!lesson.embed_html

  const [playing, setPlaying] = useState(false)

  const handlePlay = () => {
    if (!hasVideo) return
    triggerHaptic('tap')
    setPlaying(true)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled || !onLikeToggle) return
    triggerHaptic('select')
    onLikeToggle()
  }

  // Body is computed once and rendered inside either the caller's
  // `Container` or a plain <div>. Inlining the conditional (vs. using
  // `const Wrapper = Container ?? (() => <div>...)` ) is critical:
  // creating a new fallback component reference each render makes React
  // treat the subtree as a new type and remount everything — including
  // BackendImage, which restarts its <img> load and produces a visible
  // flicker on every card whenever the parent re-renders (e.g. on a
  // favorites mutation).
  const wrapperClass = bem(b, 'wrapper')
  const body = (
    <>
      <div className={bem(b, 'card')}>
        <h3 className={bem(b, 'title')}>
          {number != null && (
            <>
              {t('lesson_number', { number })}
              <br />
            </>
          )}
          {title}
        </h3>

        {onLikeToggle && (
          <button
            type="button"
            className={cn(bem(b, 'heart'), liked && bem(b, 'heart', { active: true }))}
            onClick={handleLike}
            disabled={disabled}
            aria-label="В избранное"
            aria-pressed={liked}
          >
            <HeartSvg filled={liked} />
          </button>
        )}

        <div className={bem(b, 'thumb-wrap')}>
          {playing && embedSrc ? (
            <iframe
              className={bem(b, 'iframe')}
              src={embedSrc}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              loading="lazy"
            />
          ) : playing && lesson.embed_html ? (
            <div
              className={bem(b, 'iframe')}
              dangerouslySetInnerHTML={{ __html: lesson.embed_html }}
            />
          ) : (
            <button
              type="button"
              className={bem(b, 'poster')}
              onClick={handlePlay}
              aria-label={hasVideo ? 'Воспроизвести' : 'Видео скоро'}
              disabled={!hasVideo}
            >
              <BackendImage
                src={thumbnail}
                alt=""
                className={bem(b, 'thumb')}
              />
              {hasVideo ? (
                <span className={bem(b, 'play')}>
                  <PlayIcon />
                </span>
              ) : (
                <span className={bem(b, 'soon')}>Видео скоро</span>
              )}
            </button>
          )}
        </div>
      </div>

      {onMaterialsClick && (
        <button
          type="button"
          className={bem(b, 'materials')}
          onClick={onMaterialsClick}
          aria-label={t('lesson_materials')}
        >
          <div className={bem(b, 'materials-bar')}>
            <DownloadIcon />
            <span>{t('lesson_materials')}</span>
          </div>
        </button>
      )}
    </>
  )

  return Container ? (
    <Container className={wrapperClass}>{body}</Container>
  ) : (
    <div className={wrapperClass}>{body}</div>
  )
}
