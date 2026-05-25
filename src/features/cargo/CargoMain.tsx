import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { Skeleton, BackButton, BackendImage } from '@/components'
import { EmptyState } from '@/components/EmptyState'
import { ChevronRightIcon } from '@/components/Icons'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { useCargo } from './hooks/useCargo'
import './CargoPage.scss'

const b = 'cargo-main'

export function CargoMain() {
  const { t } = useTranslation(['cargo', 'common'])
  const navigate = useNavigate()
  const lang = useLang()
  const { data: cargos = [], isLoading, error } = useCargo()

  function handleTileTap(id: number) {
    triggerHaptic('tap')
    navigate(String(id))
  }

  // Each cargo ships its own `chat_url`. Aggregate-button at the bottom
  // opens the first non-null one we find; if none of the cargos has a
  // chat link, hide the button entirely.
  const aggregateChatUrl = cargos.find((c) => c.chat_url)?.chat_url ?? null

  function handleChatTap() {
    if (!aggregateChatUrl) return
    triggerHaptic('tap')
    const tg = (window as unknown as {
      Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } }
    }).Telegram?.WebApp
    if (tg?.openTelegramLink) tg.openTelegramLink(aggregateChatUrl)
    else window.open(aggregateChatUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={b}>
      <BackButton block={b} to="/" />

      <h1 className={bem(b, 'title')}>{t('title').toUpperCase()}</h1>

      {isLoading ? (
        <>
          <div className={bem(b, 'tiles')}>
            <Skeleton variant="rect" height={171} borderRadius={20} />
            <Skeleton variant="rect" height={171} borderRadius={20} />
            <Skeleton variant="rect" height={171} borderRadius={20} />
          </div>
          <div style={{ marginTop: 25 }}>
            <Skeleton variant="rect" height={55} borderRadius={14} />
          </div>
        </>
      ) : error ? (
        <EmptyState icon="🚢" title={t('common:error.generic')} />
      ) : cargos.length === 0 ? (
        <EmptyState icon="🚢" title={t('common:empty.title')} />
      ) : (
        <>
          <div className={bem(b, 'tiles')}>
            {cargos.map((cargo) => {
              const title = pickLocaleStr(cargo.title, lang)
              const desc = pickLocaleStr(cargo.preview_text, lang)
              const image = pickLocale(cargo.image, lang)
              return (
                <button
                  key={cargo.id}
                  type="button"
                  className={bem(b, 'tile')}
                  onClick={() => handleTileTap(cargo.id)}
                >
                  {image && (
                    <BackendImage
                      src={image}
                      alt=""
                      className={bem(b, 'tile-img')}
                      loading="lazy"
                    />
                  )}
                  <div className={bem(b, 'tile-bar', { 'no-desc': !desc })}>
                    <span className={bem(b, 'tile-title', { 'size-sm': true })}>
                      {title}
                    </span>
                    {desc && (
                      <span className={bem(b, 'tile-desc')}>{desc}</span>
                    )}
                    <span className={bem(b, 'tile-chevron')} aria-hidden="true">
                      <ChevronRightIcon />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {aggregateChatUrl && (
            <button
              type="button"
              className={bem(b, 'chat-btn')}
              onClick={handleChatTap}
            >
              <img
                src="/app/images/cargo/message.svg"
                alt=""
                aria-hidden="true"
                className={bem(b, 'chat-icon')}
              />
              <span className={bem(b, 'chat-label')}>{t('main.chats_button')}</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}
