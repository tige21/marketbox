import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import i18n from '@/utils/i18n'

let onUnauthorized: (() => void) | null = null

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] ?? '',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor — attach current i18n language. Backend expects
// `lang: ru|uz` as a request header on every endpoint. We also strip
// `lang` from query params (some call sites still pass it as part of
// params for React-Query key stability) so the URL stays clean.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const fallback = i18n.language === 'uz' ? 'uz' : 'ru'
    let lang = fallback
    if (config.params && typeof config.params === 'object') {
      const p = config.params as Record<string, unknown>
      if (p['lang'] === 'ru' || p['lang'] === 'uz') {
        lang = p['lang']
      }
      delete p['lang']
    }
    config.headers = config.headers ?? {}
    if (!('lang' in config.headers)) {
      config.headers['lang'] = lang
    }
    if (!('Accept-Language' in config.headers)) {
      config.headers['Accept-Language'] = lang
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

// Response interceptor — normalize Laravel-style pagination and
// backfill missing `id` on resource items. Backend currently omits
// `id` in list/detail responses but accepts numeric ids in path
// params (1, 2, 3…), so we synthesize index-based ids matching the
// page offset. Without this, React keys collide (`undefined`) and
// navigation to `/<resource>/${id}` lands on `/<resource>/undefined`.
apiClient.interceptors.response.use(
  async (response: AxiosResponse) => {
    const body = response.data

    // 1. Laravel pagination → frontend shape.
    let normalized = body
    let pageOffset = 0
    let lastPage = 1
    let isPaginated = false
    if (
      body
      && typeof body === 'object'
      && body.meta
      && typeof body.meta === 'object'
      && 'current_page' in body.meta
    ) {
      isPaginated = true
      const m = body.meta as Record<string, unknown>
      const page = Number(m['current_page'] ?? 1)
      const perPage = Number(m['per_page'] ?? 0)
      lastPage = Number(m['last_page'] ?? 1)
      pageOffset = perPage > 0 ? (page - 1) * perPage : 0
      normalized = {
        data: body.data,
        meta: {
          page,
          perPage,
          total: Number(m['total'] ?? 0),
          totalPages: lastPage,
        },
      }
    }

    // 2. Backfill missing `id` on array items and singular data objects.
    if (normalized && typeof normalized === 'object' && 'data' in normalized) {
      const inner = (normalized as { data: unknown }).data
      if (Array.isArray(inner)) {
        inner.forEach((item, idx) => {
          if (
            item
            && typeof item === 'object'
            && !Array.isArray(item)
            && (item as Record<string, unknown>)['id'] == null
          ) {
            ;(item as Record<string, unknown>)['id'] = pageOffset + idx + 1
          }
        })
      }
    }

    // 3. Auto-fetch the remaining pages of a paginated LIST so the UI never
    //    silently shows only the first 15 of N items. The backend ignores
    //    `per_page` (fixed at 15) but honours `?page=N`, so we pull pages
    //    2..last and concatenate. `__noPaginate` on the sub-requests stops
    //    the recursion (each page response re-enters this interceptor).
    const cfg = response.config as InternalAxiosRequestConfig & { __noPaginate?: boolean }
    if (
      isPaginated
      && lastPage > 1
      && !cfg.__noPaginate
      && Array.isArray((normalized as { data: unknown }).data)
    ) {
      const MAX_PAGES = 50
      const cap = Math.min(lastPage, MAX_PAGES)
      if (lastPage > MAX_PAGES) {
        console.warn(`[pagination] ${cfg.url} has ${lastPage} pages; capping at ${MAX_PAGES}`)
      }
      const requests = []
      for (let p = 2; p <= cap; p++) {
        requests.push(
          apiClient.request({
            ...cfg,
            __noPaginate: true,
            params: { ...(cfg.params ?? {}), page: p },
          } as InternalAxiosRequestConfig & { __noPaginate?: boolean }),
        )
      }
      const more = await Promise.all(requests)
      const extra = more.flatMap((r) => {
        const d = (r.data as { data?: unknown }).data
        return Array.isArray(d) ? d : []
      })
      const merged = [...(normalized as { data: unknown[] }).data, ...extra]
      normalized = {
        ...(normalized as object),
        data: merged,
        meta: {
          ...((normalized as { meta?: object }).meta ?? {}),
          perPage: merged.length,
          totalPages: 1,
        },
      }
    }

    response.data = normalized
    return response
  },
  async (error: AxiosError) => {
    const status = error.response?.status

    // A 401 normally means the session is dead → clear it. But non-critical
    // requests can opt out via `skipAuthClear` so a transient 401 on, say,
    // the contest-gifts endpoint doesn't log a valid user out.
    const skipAuthClear =
      (error.config as (InternalAxiosRequestConfig & { skipAuthClear?: boolean }) | undefined)
        ?.skipAuthClear === true
    if (status === 401 && !skipAuthClear) {
      onUnauthorized?.()
    }

    if (status === 429) {
      const retryAfter = error.response?.headers['retry-after']
      if (retryAfter) {
        const delayMs = parseInt(retryAfter as string, 10) * 1000
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        return apiClient.request(error.config!)
      }
    }

    return Promise.reject(error)
  },
)

export function setAuthToken(token: string) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function clearAuthToken() {
  delete apiClient.defaults.headers.common['Authorization']
}

export default apiClient
