import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GlassHeader } from '@/components/GlassHeader'
import { Skeleton, BackendImage } from '@/components'
import { EmptyState } from '@/components/EmptyState'
import { lessonsApi } from '@/api/endpoints'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { triggerHaptic } from '@/utils'
import { bem } from '@/utils/cn'
import './LessonPreviewPage.scss'

const b = 'lesson-preview'

function extractKinescopeId(url: string): string | null {
  const m = url.match(/kinescope\.io\/(?:embed\/)?([A-Za-z0-9]+)/)
  return m?.[1] ?? null
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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="20" viewBox="-1 -1 22 20" fill="none" aria-hidden="true">
      <path
        d="M18.3115 1.46071C15.9773 -0.91968 13.2743 0.084255 11.6007 1.14593C10.655 1.74582 9.34498 1.74582 8.39929 1.14593C6.72564 0.0842676 4.02272 -0.919653 1.68853 1.46072C-3.85249 7.11136 5.64988 18 10 18C14.3502 18 23.8525 7.11136 18.3115 1.46071Z"
        fill={filled ? '#F7FB4B' : 'none'}
        stroke={filled ? '#F7FB4B' : 'currentColor'}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1v8m0 0 3-3m-3 3-3-3M2 12h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LessonDetailPage() {
  const lang = useLang()
  const { id = '' } = useParams()
  const lessonId = Number(id)
  const enabled = Number.isFinite(lessonId) && lessonId > 0
  const [liked, setLiked] = useState(false)
  const [playing, setPlaying] = useState(false)

  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['lesson', lessonId, lang],
    queryFn: () => lessonsApi.getById(lessonId, { lang }).then((r) => r.data.data),
    enabled,
  })

  if (isLoading) {
    return (
      <div className={b}>
        <GlassHeader showBack title="" />
        <div className={bem(b, 'content')}>
          <Skeleton variant="rect" width="60%" height={20} borderRadius={6} />
          <Skeleton variant="rect" width="100%" height={120} borderRadius={10} />
        </div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className={b}>
        <GlassHeader showBack title="" />
        <div className={bem(b, 'content')}>
          <EmptyState icon="📚" title="Урок не найден" />
        </div>
      </div>
    )
  }

  const title = pickLocaleStr(lesson.title, lang)
  const description = pickLocaleStr(lesson.description, lang) || pickLocaleStr(lesson.preview_text, lang)
  const videoUrl = lesson.video_url ?? ''
  const kinescopeId = videoUrl ? extractKinescopeId(videoUrl) : null
  const embedSrc = kinescopeId ? `https://kinescope.io/embed/${kinescopeId}?autoplay=1` : null
  const hasVideo = !!embedSrc || !!lesson.embed_html
  const posterImg = lesson.video_preview ?? pickLocale(lesson.image, lang) ?? null

  const handlePlay = () => {
    if (!hasVideo) return
    triggerHaptic('tap')
    setPlaying(true)
  }
  // Backend (May 2026) ships `documents: string[]` (URLs only). Older
  // builds still surface the richer `materials` shape with name/size —
  // accept both, normalise to `{ name, url, size? }`.
  const materials: Array<{ name: string; url: string; size?: string | null }> =
    lesson.materials && lesson.materials.length > 0
      ? lesson.materials
      : (lesson.documents ?? []).map((url) => {
          // Use the URL's last path segment as a display name. Strips
          // hashed prefixes from Laravel storage URLs ("01XXX-foo.pdf"
          // → "foo.pdf"), and decodes percent-escapes.
          let name = url.split('/').pop() ?? url
          try { name = decodeURIComponent(name) } catch { /* keep as-is */ }
          name = name.replace(/^[0-9A-Z]{20,}[._-]/, '') || name
          return { name, url }
        })

  return (
    <div className={b}>
      <GlassHeader showBack title={title} className={bem(b, 'header')} />

      <div className={bem(b, 'content')}>
        <div className={bem(b, 'player')}>
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
              {posterImg && (
                <BackendImage
                  src={posterImg}
                  alt=""
                  className={bem(b, 'poster-img')}
                />
              )}
              <span className={bem(b, 'poster-shade')} aria-hidden="true" />
              {hasVideo ? (
                <span className={bem(b, 'poster-play')}>
                  <PlayIcon />
                </span>
              ) : (
                <span className={bem(b, 'poster-soon')}>Видео скоро</span>
              )}
            </button>
          )}
        </div>

        <div className={bem(b, 'meta')}>
          <span className={bem(b, 'badge')}>УРОК {lesson.id}</span>
          {lesson.duration && (
            <span className={bem(b, 'duration')}>{lesson.duration}</span>
          )}
        </div>

        <div className={bem(b, 'title-row')}>
          <h1 className={bem(b, 'title')}>{title}</h1>
          <button
            type="button"
            className={bem(b, 'like', { active: liked })}
            onClick={() => {
              triggerHaptic('tap')
              setLiked((v) => !v)
            }}
            aria-label="В избранное"
            aria-pressed={liked}
          >
            <HeartIcon filled={liked} />
          </button>
        </div>

        {description ? (
          <p className={bem(b, 'description')}>{description}</p>
        ) : (
          <p className={bem(b, 'description', { muted: true })}>Описание скоро появится.</p>
        )}

        <section className={bem(b, 'materials')}>
          <h2 className={bem(b, 'materials-title')}>МАТЕРИАЛЫ К УРОКУ</h2>
          {materials.length > 0 ? (
            <div className={bem(b, 'materials-list')}>
              {materials.map((m, i) => (
                <a
                  key={i}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={bem(b, 'material')}
                >
                  <span className={bem(b, 'material-icon')}>
                    <DownloadIcon />
                  </span>
                  <span className={bem(b, 'material-info')}>
                    <span className={bem(b, 'material-name')}>{m.name}</span>
                    {m.size && <span className={bem(b, 'material-size')}>{m.size}</span>}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className={bem(b, 'materials-empty')}>
              Дополнительные материалы пока не добавлены.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
