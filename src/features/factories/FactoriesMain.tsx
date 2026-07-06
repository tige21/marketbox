import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { SkeletonGrid } from '@/components/SkeletonGrid'
import { EmptyState } from '@/components/EmptyState'
import { BackendImage } from '@/components/BackendImage'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { useFabrics } from './hooks'
import './FactoriesPage.scss'

const b = 'factories-main'

// Hardcoded Telegram channel for the "Перейти в канал" button — backend does
// not expose this link yet.
const CHANNEL_URL = 'https://t.me/+VbqQ8PJl6glkNzEy'

// Open a Telegram deep-link inside the Mini App when available, else fall back
// to a normal new-tab open (web).
function openTelegram(url: string) {
  const tg = (window as unknown as {
    Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } }
  }).Telegram?.WebApp
  if (tg?.openTelegramLink) tg.openTelegramLink(url)
  else window.open(url, '_blank', 'noopener,noreferrer')
}

// Each fabric (country) ships its own `chat_url`. The single "ЧАТЫ" button
// at the bottom of FactoriesMain opens the first non-null chat link we get.
// When the user is inside a country, the dedicated FactoryCountryPage shows
// that country's chat button using `fabric.chat_url`.

export function FactoriesMain() {
  const { t } = useTranslation(['factories', 'common'])
  const navigate = useNavigate()
  const lang = useLang()
  const { data: fabrics = [], isLoading, error } = useFabrics()

  function handleCountryTap(id: number) {
    triggerHaptic('tap')
    navigate(String(id))
  }

  const aggregateChatUrl = fabrics.find((f) => f.chat_url)?.chat_url ?? null

  function handleChatTap() {
    if (!aggregateChatUrl) return
    triggerHaptic('tap')
    openTelegram(aggregateChatUrl)
  }

  function handleChannelTap() {
    triggerHaptic('tap')
    openTelegram(CHANNEL_URL)
  }

  return (
    <div className={b}>
      <GlassHeader showBack title={t('factories:title')} size="bold" />

      <div className={bem(b, 'body')}>
        {isLoading ? (
          <div className={bem(b, 'grid')}>
            <SkeletonGrid count={4} height={80} borderRadius={20} />
          </div>
        ) : error ? (
          <EmptyState icon="🏭" title={t('common:error.generic')} />
        ) : fabrics.length === 0 ? (
          <EmptyState icon="🏭" title={t('common:empty.title')} />
        ) : (
          <>
            <div className={bem(b, 'grid')}>
              {fabrics.map((fabric) => {
                const title = pickLocaleStr(fabric.title, lang)
                const image = pickLocale(fabric.image, lang)
                return (
                  <button
                    key={fabric.id}
                    className={bem(b, 'tile')}
                    onClick={() => handleCountryTap(fabric.id)}
                    type="button"
                  >
                    <BackendImage
                      src={image}
                      alt=""
                      className={bem(b, 'tile-flag')}
                    />
                    <span className={bem(b, 'tile-name')}>{title}</span>
                  </button>
                )
              })}
            </div>

            {aggregateChatUrl && (
              <button
                className={bem(b, 'chat-btn')}
                onClick={handleChatTap}
                type="button"
              >
                {t('factories:chats_button')}
              </button>
            )}
          </>
        )}

        {/* Channel CTA — always available (link is static), independent of
            the fabrics fetch state. */}
        <button
          className={bem(b, 'channel-btn')}
          onClick={handleChannelTap}
          type="button"
        >
          {t('factories:channel_button', { defaultValue: 'Перейти в канал' })}
        </button>
      </div>
    </div>
  )
}
