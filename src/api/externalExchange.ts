import type { ExchangeRate, ExchangeRatesResponse } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Exchange-rate source chain (most → least preferred). All free, key-less,
// CORS-enabled, daily-updated. Each runs on different infrastructure so a
// regional block of one host doesn't take the screen down:
//   1. open.er-api.com        — direct UZS base, own infra
//   2. cbr-xml-daily.ru       — CBR mirror hosted in RU (reliable in RU/CIS),
//                               UZS rates derived as cross-rates via RUB
//   3. Fawaz @ jsdelivr CDN   — legacy primary
//   4. Fawaz @ Cloudflare Pages
// ─────────────────────────────────────────────────────────────────────────────

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

/** Per-source timeout — fail fast so the whole chain stays responsive. */
const SOURCE_TIMEOUT_MS = 6000

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS)
  try {
    const r = await fetch(url, { cache: 'no-store', ...init, signal: controller.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`)
    return (await r.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

/** Shape a `code → UZS-per-unit` map into the app's response contract. */
function buildResponse(
  uzsPerUnit: (code: string) => number,
  updatedAt: string,
  changeOf?: (code: string) => number | undefined,
): ExchangeRatesResponse {
  const rates: ExchangeRate[] = DISPLAY_CURRENCIES.map(({ code, currency }) => {
    const value = uzsPerUnit(code)
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`invalid rate for ${code}: ${value}`)
    }
    const change = changeOf?.(code)
    return {
      code,
      currency,
      buyRate: Math.round(value * 100) / 100,
      sellRate: Math.round(value * SELL_SPREAD * 100) / 100,
      centralBankRate: Math.round(value * 100) / 100,
      ...(change !== undefined ? { change } : {}),
      updatedAt,
    }
  })
  return { rates, baseCurrency: 'UZS', updatedAt }
}

// ─── Source 1: open.er-api.com (ExchangeRate-API free tier) ─────────────────

interface ErApiResponse {
  result: string
  time_last_update_unix: number
  base_code: string
  /** Units of CODE per 1 UZS (base UZS). */
  rates: Record<string, number>
}

async function fetchRatesER(): Promise<ExchangeRatesResponse> {
  const d = await fetchJson<ErApiResponse>('https://open.er-api.com/v6/latest/UZS')
  if (d.result !== 'success' || !d.rates) throw new Error(`er-api result=${d.result}`)
  const updatedAt = new Date(d.time_last_update_unix * 1000).toISOString().slice(0, 10)
  // rates[CODE] = CODE per 1 UZS → invert for UZS per 1 CODE.
  return buildResponse((code) => 1 / (d.rates[code] ?? NaN), updatedAt)
}

// ─── Source 2: cbr-xml-daily.ru (Central Bank of Russia mirror) ─────────────

interface CbrResponse {
  Date: string
  Valute: Record<string, { Nominal: number; Value: number }>
}

async function fetchRatesCBR(): Promise<ExchangeRatesResponse> {
  const d = await fetchJson<CbrResponse>('https://www.cbr-xml-daily.ru/daily_json.js')
  const v = d.Valute
  if (!v?.['UZS']) throw new Error('CBR: no UZS in Valute')
  // CBR quotes "Value RUB per Nominal units" (Nominal is 1/10/100/10000!) —
  // always divide by Nominal before crossing.
  const rubPer = (code: string): number => {
    const e = v[code]
    return e ? e.Value / e.Nominal : NaN
  }
  const rubPerUzs = rubPer('UZS')
  // Cross-rate: UZS per 1 CODE = (RUB per CODE) / (RUB per UZS).
  // RUB itself: UZS per 1 RUB = 1 / (RUB per UZS).
  const uzsPerUnit = (code: string): number =>
    code === 'RUB' ? 1 / rubPerUzs : rubPer(code) / rubPerUzs
  return buildResponse(uzsPerUnit, d.Date.slice(0, 10))
}

// ─── Sources 3/4: Fawaz currency-api (jsdelivr → Cloudflare Pages) ──────────

const FAWAZ_PRIMARY = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api'
const FAWAZ_FALLBACK = 'https://latest.currency-api.pages.dev'

type FawazBaseResponse = {
  date: string
  [base: string]: string | Record<string, number> | undefined
}

async function fetchFawaz(path: string): Promise<FawazBaseResponse> {
  try {
    return await fetchJson<FawazBaseResponse>(`${FAWAZ_PRIMARY}@latest${path}`)
  } catch (e) {
    console.warn('[exchange] fawaz jsdelivr failed, trying pages.dev', e)
    return fetchJson<FawazBaseResponse>(`${FAWAZ_FALLBACK}${path}`)
  }
}

async function fetchFawazByDate(date: string, path: string): Promise<FawazBaseResponse | null> {
  try {
    const r = await fetch(`${FAWAZ_PRIMARY}@${date}${path}`, { cache: 'force-cache' })
    if (!r.ok) return null
    return (await r.json()) as FawazBaseResponse
  } catch {
    return null
  }
}

/**
 * Previous business day relative to the API's own publication date (not the
 * client's wall clock) — avoids a zero-delta bug when `@latest` lags a day.
 */
function dayBefore(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

async function fetchRatesFawaz(): Promise<ExchangeRatesResponse> {
  const today = await fetchFawaz('/v1/currencies/uzs.json')
  const todayMap = (today['uzs'] as Record<string, number>) ?? {}

  // Fawaz is the only source with free history — keep the day-over-day
  // `change` here; other sources simply omit it (the field is optional).
  const prev = await fetchFawazByDate(dayBefore(today.date), '/v1/currencies/uzs.json')
  const prevMap = prev?.['uzs'] as Record<string, number> | undefined

  const changeOf = (code: string): number | undefined => {
    const key = code.toLowerCase()
    if (!prevMap?.[key] || !todayMap[key]) return undefined
    const nowR = 1 / todayMap[key]!
    const prevR = 1 / prevMap[key]!
    if (!Number.isFinite(prevR) || prevR <= 0) return undefined
    return Math.round(((nowR - prevR) / prevR) * 100 * 100) / 100
  }

  return buildResponse(
    (code) => 1 / (todayMap[code.toLowerCase()] ?? NaN),
    today.date,
    changeOf,
  )
}

// ─── Public entry: try sources in order ─────────────────────────────────────

const SOURCES: ReadonlyArray<{ name: string; fetch: () => Promise<ExchangeRatesResponse> }> = [
  { name: 'er-api', fetch: fetchRatesER },
  { name: 'cbr-xml-daily', fetch: fetchRatesCBR },
  { name: 'fawaz', fetch: fetchRatesFawaz },
]

/**
 * Fetch UZS exchange rates from the first source that responds. Throws only
 * when every source in the chain fails (the UI then shows its error state).
 */
export async function getExchangeRates(): Promise<ExchangeRatesResponse> {
  let lastError: unknown
  for (const source of SOURCES) {
    try {
      return await source.fetch()
    } catch (e) {
      lastError = e
      console.warn(`[exchange] source "${source.name}" failed, falling back`, e)
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('All exchange-rate sources failed')
}
