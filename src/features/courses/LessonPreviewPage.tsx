import { useState } from 'react'
import { GlassHeader } from '@/components/GlassHeader'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './LessonPreviewPage.scss'

const b = 'lesson-preview'

function PlayIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="28" fill="rgba(0,0,0,0.55)" />
      <circle cx="28" cy="28" r="27" stroke="rgba(255,255,255,0.85)" strokeWidth="1" />
      <path d="M22 18L40 28L22 38V18Z" fill="white" />
    </svg>
  )
}

const MOCK = {
  courseTitle: 'БИЗНЕС С КИТАЕМ',
  lessonNumber: 1,
  lessonTitle: 'Карго-доставка из Китая: что нужно знать в 2026',
  videoUrl: 'https://kinescope.io/iUKdgKCmcXvGRbQdXPYBN9',
  posterUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=70',
  duration: '14:32',
  description:
    'В первом уроке разбираем, чем «белое» карго отличается от «серого», какие документы нужны на каждом этапе и как считать конечную себестоимость партии с учётом таможни и логистики.',
  materials: [
    { id: 1, name: 'Чек-лист по таможне.pdf', size: '420 КБ' },
    { id: 2, name: 'Шаблон договора.docx', size: '64 КБ' },
  ],
}

function extractKinescopeId(url: string): string | null {
  const m = url.match(/kinescope\.io\/(?:embed\/)?([A-Za-z0-9]+)/)
  return m?.[1] ?? null
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
      <path d="M7 1v8m0 0 3-3m-3 3-3-3M2 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LessonPreviewPage() {
  const [liked, setLiked] = useState(false)
  const [playing, setPlaying] = useState(false)
  const id = extractKinescopeId(MOCK.videoUrl)
  const embedSrc = id ? `https://kinescope.io/embed/${id}` : null

  const handlePlay = () => {
    triggerHaptic('tap')
    setPlaying(true)
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={MOCK.courseTitle} />

      <div className={bem(b, 'content')}>
        <div className={bem(b, 'player')}>
          {!playing ? (
            <button
              type="button"
              className={bem(b, 'poster')}
              onClick={handlePlay}
              aria-label="Воспроизвести"
            >
              <img
                className={bem(b, 'poster-img')}
                src={MOCK.posterUrl}
                alt=""
              />
              <span className={bem(b, 'poster-shade')} aria-hidden="true" />
              <span className={bem(b, 'poster-play')}>
                <PlayIcon />
              </span>
            </button>
          ) : embedSrc ? (
            <iframe
              className={bem(b, 'iframe')}
              src={embedSrc}
              title={MOCK.lessonTitle}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className={bem(b, 'player-fallback')}>Видео недоступно</div>
          )}
        </div>

        <div className={bem(b, 'meta')}>
          <span className={bem(b, 'badge')}>УРОК {MOCK.lessonNumber}</span>
          <span className={bem(b, 'duration')}>{MOCK.duration}</span>
        </div>

        <div className={bem(b, 'title-row')}>
          <h1 className={bem(b, 'title')}>{MOCK.lessonTitle}</h1>
          <button
            type="button"
            className={bem(b, 'like', { active: liked })}
            onClick={() => setLiked((v) => !v)}
            aria-label="В избранное"
            aria-pressed={liked}
          >
            <HeartIcon filled={liked} />
          </button>
        </div>

        <p className={bem(b, 'description')}>{MOCK.description}</p>

        <section className={bem(b, 'materials')}>
          <h2 className={bem(b, 'materials-title')}>МАТЕРИАЛЫ К УРОКУ</h2>
          <div className={bem(b, 'materials-list')}>
            {MOCK.materials.map((m) => (
              <button key={m.id} type="button" className={bem(b, 'material')}>
                <span className={bem(b, 'material-icon')}>
                  <DownloadIcon />
                </span>
                <span className={bem(b, 'material-info')}>
                  <span className={bem(b, 'material-name')}>{m.name}</span>
                  <span className={bem(b, 'material-size')}>{m.size}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
