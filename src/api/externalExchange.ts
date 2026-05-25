import type { ExchangeRate, ExchangeRatesResponse } from './types'

// Free currency API by Fawaz Ahmed — no auth, CORS-enabled, daily updates.
// Primary: jsdelivr CDN; fallback: Cloudflare Pages mirror.
// Source: https://github.com/fawazahmed0/exchange-api
const PRIMARY = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api'
const FALLBACK = 'https://latest.currency-api.pages.dev'

// Display order + human-readable names. Base is UZS; shown list excludes it.
const DISPLAY_CURRENCIES: ReadonlyArray<{ code: string; currency: string }> = [
  { code: 'USD', currency: 'Доллар США' },
  { code: 'EUR', currency: 'Евро' },
  { code: 'RUB', currency: 'Российский рубль' },
  { code: 'CNY', currency: 'Китайский юань' },
  { code: 'TRY', currency: 'Турецкая лира' },
  { code: 'KGS', currency: 'Киргизский сом' },
  { code: 'KZT', currency: 'Казахстанский тенге' },
]

// Small spread on buy→sell so UI shows two distinct values.
// Real exchange booths keep ~0.5–1% spread.
const SELL_SPREAD = 1.005

type FawazBaseResponse = {
  date: string
  [base: string]: string | Record<string, number> | undefined
}

async function fetchWithFallback(path: string): Promise<FawazBaseResponse> {
  try {
    const r = await fetch(`${PRIMARY}@latest${path}`, { cache: 'no-store' })
    if (r.ok) return (await r.json()) as FawazBaseResponse
    throw new Error(`jsdelivr HTTP ${r.status}`)
  } catch {
    const r = await fetch(`${FALLBACK}${path}`, { cache: 'no-store' })
    if (!r.ok) throw new Error(`Fawaz API failed: HTTP ${r.status}`)
    return (await r.json()) as FawazBaseResponse
  }
}

async function fetchByDate(date: string, path: string): Promise<FawazBaseResponse | null> {
  try {
    const r = await fetch(`${PRIMARY}@${date}${path}`, { cache: 'force-cache' })
    if (!r.ok) return null
    return (await r.json()) as FawazBaseResponse
  } catch {
    return null
  }
}

/**
 * Previous business day relative to the API's own publication date
 * (not the client's wall clock). Fawaz publishes ~daily but with a small
 * lag, so `@latest` can already be "yesterday" in client terms — using the
 * API's date avoids a zero-delta bug where today and "yesterday" are the
 * same snapshot.
 */
function dayBefore(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Fetch live rates from UZS base, convert to the fronted `ExchangeRate[]` shape.
 * Buy rate = UZS per 1 unit of foreign currency.
 * Sell rate adds a small spread for UX (real booths work that way).
 * `change` = % delta vs. yesterday's rate; silently omitted if yesterday fails.
 */
export async function getRatesFromFawaz(): Promise<ExchangeRatesResponse> {
  const today = await fetchWithFallback('/v1/currencies/uzs.json')
  const todayMap = (today['uzs'] as Record<string, number>) ?? {}

  const prev = await fetchByDate(dayBefore(today.date), '/v1/currencies/uzs.json')
  const prevMap = prev?.['uzs'] as Record<string, number> | undefined

  const rates: ExchangeRate[] = DISPLAY_CURRENCIES.map(({ code, currency }) => {
    const key = code.toLowerCase()
    const uzsPerUnitToday = todayMap[key] ? 1 / todayMap[key]! : NaN

    let change: number | undefined
    if (prevMap?.[key]) {
      const uzsPerUnitPrev = 1 / prevMap[key]!
      if (Number.isFinite(uzsPerUnitPrev) && uzsPerUnitPrev > 0) {
        change = ((uzsPerUnitToday - uzsPerUnitPrev) / uzsPerUnitPrev) * 100
        change = Math.round(change * 100) / 100 // 2 decimals
      }
    }

    return {
      code,
      currency,
      buyRate: Math.round(uzsPerUnitToday * 100) / 100,
      sellRate: Math.round(uzsPerUnitToday * SELL_SPREAD * 100) / 100,
      centralBankRate: Math.round(uzsPerUnitToday * 100) / 100,
      ...(change !== undefined ? { change } : {}),
      updatedAt: today.date,
    }
  })

  return {
    rates,
    baseCurrency: 'UZS',
    updatedAt: today.date,
  }
}
