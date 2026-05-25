import { Fragment, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GlassHeader } from '@/components/GlassHeader'
import { EmptyState } from '@/components/EmptyState'
import type { ExchangeRate } from '@/api/types'
import { bem } from '@/utils/cn'
import { useHaptic } from '@/hooks/useHaptic'
import { useExchangeRates } from './hooks'
import './ExchangePage.scss'

const b = 'exchange-page'

// Currency labels are resolved via i18n (`exchange.currencies.<code>`).
// Visual meta (flag, symbol, local flag asset) stays static.
const CURRENCY_META: Record<string, { flag: string; flagImg: string; symbol: string }> = {
  UZS: { flag: '🇺🇿', flagImg: '/app/images/exchange/flag-uzs.png', symbol: 'сум' },
  USD: { flag: '🇺🇸', flagImg: '/app/images/exchange/flag-usd.png', symbol: '$' },
  EUR: { flag: '🇪🇺', flagImg: '', symbol: '€' },
  RUB: { flag: '🇷🇺', flagImg: '/app/images/exchange/flag-rub.png', symbol: '₽' },
  CNY: { flag: '🇨🇳', flagImg: '/app/images/exchange/flag-cny.png', symbol: '¥' },
  KZT: { flag: '🇰🇿', flagImg: '', symbol: '₸' },
  TRY: { flag: '🇹🇷', flagImg: '/app/images/exchange/flag-try.png', symbol: '₺' },
  KGS: { flag: '🇰🇬', flagImg: '/app/images/exchange/flag-kgs.png', symbol: 'с' },
}

function formatRate(rate: number): string {
  if (rate >= 1000) return rate.toLocaleString('ru-RU')
  if (rate < 1) return rate.toFixed(4)
  return rate.toFixed(2)
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// ─── Rates Card ─────────────────────────────────────────────

interface RatesCardProps {
  rates: ExchangeRate[]
}

function RatesCard({ rates }: RatesCardProps) {
  const { t } = useTranslation('exchange')
  return (
    <div className={bem(b, 'rates-section')}>
      <h2 className={bem(b, 'section-title')}>{t('section_rates')}</h2>
      <div className={bem(b, 'list')}>
        {rates.map((rate, i) => {
          const meta = CURRENCY_META[rate.code]
          const currencyLabel = t(`currencies.${rate.code}`, { defaultValue: rate.currency })
          return (
            <Fragment key={rate.code}>
              {i > 0 && <div className={bem(b, 'divider')} />}
              <div className={bem(b, 'rate-row')}>
                <div className={bem(b, 'rate-name')}>
                  {meta?.flagImg ? (
                    <img src={meta.flagImg} alt={rate.code} className={bem(b, 'rate-flag')} />
                  ) : (
                    <span className={bem(b, 'rate-flag-emoji')}>{meta?.flag ?? '💱'}</span>
                  )}
                  <div className={bem(b, 'rate-info')}>
                    <span className={bem(b, 'rate-currency')}>{currencyLabel}</span>
                    <span className={bem(b, 'rate-code')}>{rate.code}</span>
                  </div>
                </div>
                <div className={bem(b, 'rate-right')}>
                  <span className={bem(b, 'rate-value')}>{formatRate(rate.buyRate)}</span>
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ─── Converter ──────────────────────────────────────────────

interface ConverterProps {
  rates: ExchangeRate[]
}

function Converter({ rates }: ConverterProps) {
  const { t } = useTranslation('exchange')
  const haptic = useHaptic()
  const [fromCode, setFromCode] = useState<string>('USD')
  const [toCode, setToCode] = useState<string>('UZS')
  const [fromAmount, setFromAmount] = useState<string>('')

  const toAmount = useMemo(() => {
    const numericAmount = parseFloat(fromAmount)
    if (!fromAmount || isNaN(numericAmount) || numericAmount <= 0) return ''

    if (fromCode === 'UZS') {
      const toRate = rates.find((r) => r.code === toCode)
      if (!toRate) return ''
      return (numericAmount / toRate.sellRate).toFixed(4)
    }

    if (toCode === 'UZS') {
      const fromRate = rates.find((r) => r.code === fromCode)
      if (!fromRate) return ''
      return (numericAmount * fromRate.buyRate).toLocaleString('ru-RU', { maximumFractionDigits: 0 })
    }

    const fromRate = rates.find((r) => r.code === fromCode)
    const toRate = rates.find((r) => r.code === toCode)
    if (!fromRate || !toRate) return ''
    const inUZS = numericAmount * fromRate.buyRate
    return (inUZS / toRate.sellRate).toFixed(4)
  }, [fromAmount, fromCode, toCode, rates])

  const allCodes = ['UZS', ...rates.filter(r => r.code !== 'UZS').map((r) => r.code)]

  const handleSwap = () => {
    haptic.select()
    setFromCode(toCode)
    setToCode(fromCode)
    setFromAmount(toAmount)
  }

  return (
    <div className={bem(b, 'converter')}>
      <h2 className={bem(b, 'section-title')}>{t('converter.title')}</h2>

      <div className={bem(b, 'converter-body')}>
        <div className={bem(b, 'converter-field')}>
          <div className={bem(b, 'converter-row')}>
            <select
              className={bem(b, 'converter-select')}
              value={fromCode}
              onChange={(e) => { haptic.select(); setFromCode(e.target.value) }}
              aria-label={t('converter.from_label')}
            >
              {allCodes.map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_META[code]?.flag ?? '💱'} {code}
                </option>
              ))}
            </select>
            <input
              type="number"
              inputMode="decimal"
              className={bem(b, 'converter-input')}
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              min="0"
              aria-label={t('converter.from_label')}
            />
          </div>
        </div>

        <button
          type="button"
          className={bem(b, 'swap-btn')}
          onClick={handleSwap}
          aria-label={t('swap_aria')}
        >
          ⇅
        </button>

        <div className={bem(b, 'converter-field')}>
          <div className={bem(b, 'converter-row')}>
            <select
              className={bem(b, 'converter-select')}
              value={toCode}
              onChange={(e) => { haptic.select(); setToCode(e.target.value) }}
              aria-label={t('converter.to_label')}
            >
              {allCodes.map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_META[code]?.flag ?? '💱'} {code}
                </option>
              ))}
            </select>
            <input
              type="text"
              readOnly
              className={bem(b, 'converter-input', { readonly: true })}
              placeholder="0"
              value={toAmount}
              aria-label={t('converter.to_label')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Channel CTA ─────────────────────────────────────────────

function ChannelCta() {
  const { t } = useTranslation('exchange')
  const haptic = useHaptic()

  const handleSubscribe = () => {
    haptic.tap()
    window.open('https://t.me/boriga_baraka', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={bem(b, 'channel-card')}>
      <p className={bem(b, 'channel-title')}>{t('channel_title')}</p>
      <p className={bem(b, 'channel-subtitle')}>{t('channel_subtitle')}</p>
      <p className={bem(b, 'channel-desc')}>{t('channel_description')}</p>
      <button
        type="button"
        className={bem(b, 'channel-btn')}
        onClick={handleSubscribe}
      >
        {t('channel_telegram')}
      </button>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────

function ExchangeSkeleton() {
  return (
    <div className={bem(b, 'rates-section')}>
      <div className="skeleton skeleton--variant-text" style={{ width: 120, height: 18, marginBottom: 12 }} />
      <div className={bem(b, 'list')}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Fragment key={i}>
            {i > 0 && <div className={bem(b, 'divider')} />}
            <div className={bem(b, 'rate-row')}>
              <div className={bem(b, 'rate-name')}>
                <div className="skeleton skeleton--variant-rect" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className="skeleton skeleton--variant-text" style={{ width: 120, height: 14 }} />
                  <div className="skeleton skeleton--variant-text" style={{ width: 40, height: 12 }} />
                </div>
              </div>
              <div className={bem(b, 'rate-right')}>
                <div className="skeleton skeleton--variant-text" style={{ width: 70, height: 14 }} />
                <div className="skeleton skeleton--variant-text" style={{ width: 45, height: 20, borderRadius: 10 }} />
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────

export function ExchangePage() {
  const { t } = useTranslation('exchange')

  const { data, isLoading, error } = useExchangeRates()

  const rates: ExchangeRate[] = data?.rates ?? []

  if (error) {
    return (
      <div className={b}>
        <GlassHeader showBack size="medium" title={t('title')} />
        <div className={bem(b, 'content')}>
          <EmptyState icon="💱" title={t('common:error.generic')} />
        </div>
      </div>
    )
  }

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title={t('title')} />

      <div className={bem(b, 'content')}>
        {isLoading ? (
          <ExchangeSkeleton />
        ) : rates.length === 0 ? (
          <EmptyState icon="💱" title={t('common:empty.title')} />
        ) : (
          <>
            <RatesCard rates={rates} />
            <Converter rates={rates} />
            <ChannelCta />
          </>
        )}
      </div>
    </div>
  )
}
