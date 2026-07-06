import apiClient from './client'
import type { Lang } from './locale'
import { mockApi } from '../mocks/stubs'
import type {
  ApiResponse,
  BackendUser,
  Category,
  Factory,
  WholesaleSeller,
  ChinaGuideItem,
  ChinaGuideType,
  Job,
  DesignService,
  DesignServiceType,
  ExchangeRatesResponse,
  UserProfile,
  UpdateProfileRequest,
  FavoriteItem,
  AddFavoriteRequest,
  MoneyBalance,
  Transaction,
  WithdrawRequest,
  WithdrawResponse,
  ReferralStats,
  PaginationParams,
  BackendDocumentation,
  BackendDocumentationCandidate,
  BackendArticle,
  SubscriptionGiftsResponse,
  BackendCargo,
  BackendCargoInfo,
  BackendCourse,
  BackendCourseLesson,
  BackendModule,
  BackendLesson,
  BackendCargoLogistic,
  BackendEvent,
  BackendSeller,
  BackendWork,
  BackendCandidate,
  BackendWorkCandidate,
  BackendDesignServiceInfo,
  BackendDesignCandidate,
  BackendGuid,
  BackendMarket,
  BackendHotel,
  BackendRestaurant,
  BackendTour,
  BackendTranslator,
  BackendFabric,
  BackendFabricSection,
  BackendCompany,
  BackendMenuInfo,
  BackendTransaction,
  BackendWithdrawal,
  BackendWithdrawalStatus,
  BackendReferralStatus,
  BackendReferralPage,
} from './types'

/**
 * The axios request interceptor already appends `lang` as a query param.
 * We keep `lang` in typed signatures so hooks can put it in query keys,
 * which is what drives React-Query invalidation on language switch.
 */
export interface LangAware {
  lang?: Lang
}

// Routes the backend doesn't implement yet (auth, /user/me, /subscription,
// /favorites, /money/*, /exchange/rates) are short-circuited via `mockApi`
// when this flag is on. The flag is set in .env.production / .env.development.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

// ─── Auth (real backend) ─────────────────────────────────────
// `initDataRaw` from `@telegram-apps/sdk-react` is already a URL-encoded
// query-string with exactly the fields the backend's callback verifies
// (`query_id`, `user`, `auth_date`, `hash`). Append it as-is so axios
// doesn't re-encode the `hash` and break the signature check.
//
// When the Mini App is opened via `t.me/<bot>?start=<refcode>`, Telegram
// puts the value into `start_param` inside initData. Backend wants it as
// `ref` on the callback — extract and re-append.
function extractRefFromInitData(initDataRaw: string): string | null {
  const m = initDataRaw.match(/(?:^|&)start_param=([^&]+)/)
  return m && m[1] ? m[1] : null
}

export const authApi = {
  loginWithTelegram: (initDataRaw: string) => {
    const ref = extractRefFromInitData(initDataRaw)
    const url = ref
      ? `/api/auth/telegram/callback?${initDataRaw}&ref=${ref}`
      : `/api/auth/telegram/callback?${initDataRaw}`
    return apiClient.get<TelegramAuthResponse>(url)
  },
  logout: () => apiClient.post('/api/logout'),
}

interface TelegramAuthResponse {
  success: boolean
  token: string
  user: Record<string, unknown>
}

// ─── User ───────────────────────────────────────────────────
// `GET /api/user` returns `{ user, subscription }` (Bearer-auth required).
// Adapt to UserProfile (camelCase). Subscription on backend uses
// `is_actual` + `date_expired` — map to isPremium/expiresAt.
async function fetchMeAsUserProfile() {
  const r = await apiClient.get<{
    user?: BackendUser
    subscription?: {
      id?: number
      is_actual?: boolean
      date_expired?: string | null
      type?: 'standard' | 'full_access' | null
      unlocked_module_level?: number | null
      consecutive_months?: number | null
    }
  }>('/api/user')
  const raw = r.data?.user ?? ({} as BackendUser)
  const sub = r.data?.subscription
  const profile: UserProfile = {
    id: Number(raw.id ?? 0),
    telegramId: Number(raw.telegram_id ?? 0),
    // Prefer the user-editable `name`/`surname` over the read-only
    // `telegram_*` fields so PUT /user updates show up immediately.
    firstName: raw.name ?? raw.telegram_first_name ?? '',
    lastName: raw.surname ?? raw.telegram_last_name,
    username: raw.telegram_username,
    photoUrl: raw.telegram_photo_url,
    email: raw.email,
    languageCode: 'ru',
    subscription: {
      isPremium: !!sub?.is_actual,
      expiresAt: sub?.date_expired ?? null,
      plan: sub?.is_actual ? 'premium' : 'free',
      type: sub?.type ?? null,
      unlockedModuleLevel: sub?.unlocked_module_level ?? null,
      consecutiveMonths: sub?.consecutive_months ?? null,
    },
    referralCode: raw.referral_code,
    balance: raw.balance,
    referralsCount: raw.referrals_count,
    referralsCountActive: raw.referrals_count_active,
    pendingAmount: raw.pending,
    rejectedAmount: raw.rejected,
    referralStatus: raw.referral_status,
    createdAt: '',
  }
  return { ...r, data: { data: profile } as ApiResponse<UserProfile> }
}

// Real backend update via `PUT /api/user`. Per Swagger this endpoint
// takes `name`, `surname`, `email` as QUERY parameters (not body) and
// returns no body. After the PUT we re-fetch `/user` to get the updated
// profile for cache-stitch convenience.
async function updateMeOnBackend(data: UpdateProfileRequest) {
  const params: Record<string, string> = {}
  if (data.firstName !== undefined) params['name'] = data.firstName
  if (data.lastName !== undefined) params['surname'] = data.lastName
  // (email is not editable from the UI yet but we forward it if passed)
  const email = (data as UpdateProfileRequest & { email?: string }).email
  if (email !== undefined) params['email'] = email
  await apiClient.put('/api/user', null, { params })
  return fetchMeAsUserProfile()
}

// Use the real backend only when auth itself is real (i.e. we have a valid
// token from the Telegram callback). In `VITE_MOCK_TG=true` dev mode the
// session token is "dev-session" which the backend would reject — fall
// back to the mock profile so local dev keeps working.
const USE_MOCK_TG = import.meta.env['VITE_MOCK_TG'] === 'true'

export const userApi = {
  getProfile: () =>
    USE_MOCK_TG ? mockApi.getMe() : fetchMeAsUserProfile(),
  updateProfile: (data: UpdateProfileRequest) =>
    USE_MOCK_TG ? mockApi.updateMe(data) : updateMeOnBackend(data),
  getSubscription: () => mockApi.getSubscription(),
}

// ─── Subscription contest gifts (real backend) ──────────────
// Bearer-auth; the home-header contest panel reads the ladder + how many
// gifts the user has unlocked (`passed_count` = consecutive months).
export const subscriptionGiftsApi = {
  getList: (params?: LangAware) =>
    apiClient.get<SubscriptionGiftsResponse>('/api/subscription-gifts', {
      params,
      // Non-critical premium widget — a 401 here must NOT wipe the session.
      skipAuthClear: true,
    } as Parameters<typeof apiClient.get>[1] & { skipAuthClear: true }),
}

// ─── Categories (MSW-mocked; legacy shape for home tiles) ───
export const categoriesApi = {
  getAll: () => apiClient.get<ApiResponse<Category[]>>('/api/categories'),
}

// ─── Home menu (real backend) ───────────────────────────────
export const menuApi = {
  getAll: (params?: LangAware) =>
    apiClient.get<ApiResponse<BackendMenuInfo[]>>('/api/menu', { params }),
}

// ─── Courses (real backend) ─────────────────────────────────
// Backend (May 2026) replaced `/courses/{course}/lessons` with a 3-level
// hierarchy: Course → Module → Lesson. The old endpoint is gone — use
// `getModules(courseId)` to list modules, then `modulesApi.getLessons(moduleId)`.
export const coursesApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendCourse[]>>('/api/courses', { params }),

  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendCourse>>(`/api/courses/${id}`, { params }),

  /** Modules for a given course. */
  getModules: (courseId: string | number, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendModule[]>>(
      `/api/courses/${courseId}/modules`,
      { params },
    ),
}

// ─── Modules (real backend) ─────────────────────────────────
export const modulesApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendModule[]>>('/api/modules', { params }),

  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendModule>>(`/api/modules/${id}`, { params }),

  /** Lessons inside a given module. */
  getLessons: (moduleId: string | number, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendCourseLesson[]>>(
      `/api/modules/${moduleId}/lessons`,
      { params },
    ),
}

// ─── Lessons (real backend) ─────────────────────────────────
// Flat lesson resource. Backend accepts `type=cargo` or `type=module`
// (the May 2026 rename of `course` → `module`). Detail page powers the
// video player.
export const lessonsApi = {
  getList: (
    params?: PaginationParams & LangAware & { type?: 'cargo' | 'module' },
  ) =>
    apiClient.get<ApiResponse<BackendLesson[]>>('/api/lessons', { params }),

  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendLesson>>(`/api/lessons/${id}`, { params }),

  /** Authenticated. Lessons the current user marked as favorite. */
  getFavorites: (params?: LangAware) =>
    apiClient.get<ApiResponse<BackendLesson[]>>('/api/user/lessons/favorites', { params }),

  /** Authenticated. Toggle favorite. */
  addFavorite: (id: number | string) =>
    apiClient.post<ApiResponse<BackendLesson>>(`/api/user/lessons/${id}/favorite`),
  removeFavorite: (id: number | string) =>
    apiClient.delete<ApiResponse<BackendLesson>>(`/api/user/lessons/${id}/favorite`),
}

// ─── Cargo (real backend) ───────────────────────────────────
export const cargoApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendCargo[]>>('/api/cargo', { params }),

  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendCargo>>(`/api/cargo/${id}`, { params }),

  /** Aggregate endpoint: cargo + lessons + logistics + fulfillment. */
  getInfo: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendCargoInfo>>(`/api/cargo/${id}/info`, { params }),

  /** Lessons-only slice — lighter than `getInfo` when other arrays aren't needed. */
  getLessons: (cargoId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendLesson[]>>(`/api/cargo/${cargoId}/lessons`, { params }),

  /** Logistics-only slice. */
  getLogistics: (cargoId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendCargoLogistic[]>>(`/api/cargo/${cargoId}/logistics`, { params }),

  /** Fulfillment-only slice. */
  getFulfillment: (cargoId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendCargoLogistic[]>>(`/api/cargo/${cargoId}/fulfillment`, { params }),
}

/** Real backend. Flat list of all logistics/fulfillment providers. */
export const cargoLogisticsApi = {
  /**
   * @param params.type  1 = logistics, 2 = fulfillment (client-side filter)
   */
  getAll: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendCargoLogistic[]>>(
      '/api/cargo-logistics',
      { params },
    ),

  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendCargoLogistic>>(
      `/api/cargo-logistics/${id}`,
      { params },
    ),
}

// ─── Factories (real backend: 3-level) ─────────────────────
export const factoriesApi = {
  getFabrics: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendFabric[]>>('/api/fabrics', { params }),
  getFabric: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendFabric>>(`/api/fabrics/${id}`, { params }),
  getSections: (fabricId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendFabricSection[]>>(
      `/api/fabrics/${fabricId}/sections`,
      { params },
    ),
  getCompaniesInSection: (
    fabricId: number | string,
    sectionId: number | string,
    params?: PaginationParams & LangAware,
  ) =>
    apiClient.get<ApiResponse<BackendCompany[]>>(
      `/api/fabrics/${fabricId}/sections/${sectionId}/companies`,
      { params },
    ),

  /** Global flat listing of fabric sections (across all fabrics). */
  getAllSections: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendFabricSection[]>>('/api/fabric-sections', { params }),

  /** Single fabric section by id. */
  getSectionById: (sectionId: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendFabricSection>>(
      `/api/fabric-sections/${sectionId}`,
      { params },
    ),

  /** Global flat listing of companies (across all fabrics + sections). */
  getAllCompanies: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendCompany[]>>('/api/companies', { params }),

  /** Single company by id. */
  getCompanyById: (companyId: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendCompany>>(`/api/companies/${companyId}`, { params }),

  // Legacy fronted-only types — deprecated but kept for TS compat.
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<Factory[]>>('/api/factories', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<Factory>>(`/api/factories/${id}`),
}

// ─── Sellers (real backend) ─────────────────────────────────
export const sellersApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendSeller[]>>('/api/sellers', { params }),
  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendSeller>>(`/api/sellers/${id}`, { params }),
}

// Kept under wholesaleApi name for back-compat; implementation hits /sellers now.
export const wholesaleApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<WholesaleSeller[]>>('/api/wholesale', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<WholesaleSeller>>(`/api/wholesale/${id}`),
}

// ─── China Guide (real backend — 5 separate endpoints) ─────
export const chinaGuideApi = {
  getMarkets: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendMarket[]>>('/api/markets', { params }),
  getMarket: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendMarket>>(`/api/markets/${id}`, { params }),

  getHotels: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendHotel[]>>('/api/hotels', { params }),
  getHotel: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendHotel>>(`/api/hotels/${id}`, { params }),

  getRestaurants: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendRestaurant[]>>('/api/restaurants', { params }),
  getRestaurant: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendRestaurant>>(`/api/restaurants/${id}`, { params }),

  getTours: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendTour[]>>('/api/tours', { params }),
  getTour: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendTour>>(`/api/tours/${id}`, { params }),

  getTranslators: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendTranslator[]>>('/api/translators', { params }),
  getTranslator: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendTranslator>>(`/api/translators/${id}`, { params }),

  getGuids: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendGuid[]>>('/api/guids', { params }),

  /** Single guide (city/region) detail. */
  getGuid: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendGuid>>(`/api/guids/${id}`, { params }),

  /** Per-guide listings — useful when a guide page filters its own
   *  markets/hotels/etc. The flat `/markets`-style endpoints above
   *  return everything across all guides. */
  getGuidMarkets: (guidId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendMarket[]>>(`/api/guids/${guidId}/markets`, { params }),
  getGuidHotels: (guidId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendHotel[]>>(`/api/guids/${guidId}/hotels`, { params }),
  getGuidRestaurants: (guidId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendRestaurant[]>>(`/api/guids/${guidId}/restaurants`, { params }),
  getGuidTours: (guidId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendTour[]>>(`/api/guids/${guidId}/tours`, { params }),
  getGuidTranslators: (guidId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendTranslator[]>>(`/api/guids/${guidId}/translators`, { params }),

  // Legacy interface retained for back-compat with fronted types.
  getByType: (type: ChinaGuideType, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<ChinaGuideItem[]>>(`/api/china-guide/${type}`, { params }),
  getById: (type: ChinaGuideType, id: string) =>
    apiClient.get<ApiResponse<ChinaGuideItem>>(`/api/china-guide/${type}/${id}`),
}

// ─── Jobs (real backend: works + candidates) ───────────────
export const worksApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendWork[]>>('/api/works', { params }),
  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendWork>>(`/api/works/${id}`, { params }),
  getCandidates: (workId: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendWorkCandidate[]>>(
      `/api/works/${workId}/candidates`,
      { params },
    ),
}

export const candidatesApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendCandidate[]>>('/api/candidates', { params }),
  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendCandidate>>(`/api/candidates/${id}`, { params }),
}

// Legacy name (Job with hybrid candidate/vacancy shape). Deprecated — kept for MSW.
export const jobsApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<Job[]>>('/api/jobs', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<Job>>(`/api/jobs/${id}`),
}

// ─── Design Services (real backend: services + candidates) ─
export const designServicesBackendApi = {
  getServices: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendDesignServiceInfo[]>>(
      '/api/design-services',
      { params },
    ),
  getService: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendDesignServiceInfo>>(
      `/api/design-services/${id}`,
      { params },
    ),
  getCandidatesByService: (
    serviceId: number | string,
    params?: PaginationParams & LangAware,
  ) =>
    apiClient.get<ApiResponse<BackendDesignCandidate[]>>(
      `/api/design-services/${serviceId}/candidates`,
      { params },
    ),
  getCandidates: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendDesignCandidate[]>>(
      '/api/design-candidates',
      { params },
    ),
  /** Single design-service candidate detail. */
  getCandidate: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendDesignCandidate>>(
      `/api/design-candidates/${id}`,
      { params },
    ),
}

// Legacy (rich DesignService shape from fronted mock). Deprecated — kept for MSW.
export const designServicesApi = {
  getList: (params?: PaginationParams & LangAware & { type?: DesignServiceType }) =>
    apiClient.get<ApiResponse<DesignService[]>>('/api/design-services', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<DesignService>>(`/api/design-services/${id}`),
}

// ─── Documents (real backend: /documentations) ──────────────
export const documentationsApi = {
  getAll: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendDocumentation[]>>(
      '/api/documentations',
      { params },
    ),

  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendDocumentation>>(
      `/api/documentations/${id}`,
      { params },
    ),

  /** Global flat listing of documentation candidates (across all docs). */
  getAllCandidates: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendDocumentationCandidate[]>>(
      '/api/documentation-candidates',
      { params },
    ),
  /** Single documentation candidate by id. */
  getCandidateById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendDocumentationCandidate>>(
      `/api/documentation-candidates/${id}`,
      { params },
    ),

  getCandidates: (id: number | string, params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendDocumentationCandidate[]>>(
      `/api/documentations/${id}/candidates`,
      { params },
    ),
}

// ─── Exchange (stub-mocked; usually shadowed by Fawaz API) ──
export const exchangeApi = {
  getRates: () =>
    USE_MOCKS
      ? mockApi.getExchangeRates()
      : apiClient.get<ApiResponse<ExchangeRatesResponse>>('/api/exchange/rates'),
}

// ─── Events (real backend) ──────────────────────────────────
export const eventsApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendEvent[]>>('/api/events', { params }),
  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendEvent>>(`/api/events/${id}`, { params }),
}

// ─── News → Articles (real backend) ─────────────────────────
export const newsApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendArticle[]>>('/api/articles', { params }),

  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendArticle>>(`/api/articles/${id}`, { params }),
}

// ─── Favorites (stub-mocked; no real backend yet) ───────────
export const favoritesApi = {
  getAll: () =>
    USE_MOCKS
      ? mockApi.getFavorites()
      : apiClient.get<ApiResponse<FavoriteItem[]>>('/api/favorites'),
  add: (data: AddFavoriteRequest) =>
    USE_MOCKS
      ? mockApi.addFavorite(data)
      : apiClient.post<ApiResponse<FavoriteItem>>('/api/favorites', data),
  remove: (id: string) =>
    USE_MOCKS ? mockApi.removeFavorite(id) : apiClient.delete(`/api/favorites/${id}`),
}

// ─── Transactions (real backend) ────────────────────────────
// Balance + referral stats are now part of GET /api/user (see userApi).
// Withdrawals live in withdrawalsApi below.
export const transactionsApi = {
  getList: (params?: PaginationParams & LangAware) =>
    apiClient.get<ApiResponse<BackendTransaction[]>>('/api/transactions', { params }),
  getById: (id: number | string, params?: LangAware) =>
    apiClient.get<ApiResponse<BackendTransaction>>(`/api/transactions/${id}`, { params }),
}

// ─── Withdrawals (real backend, May 2026) ───────────────────
// History list + create-request for cash-outs. Backend wraps the
// list under `{ success, withdrawals: [...] }` so we unwrap here.
export const withdrawalsApi = {
  getList: () =>
    apiClient
      .get<{ success: boolean; withdrawals: BackendWithdrawal[] }>('/api/withdrawals')
      .then((r) => ({ ...r, data: r.data?.withdrawals ?? [] })),
  create: (amount: number) =>
    apiClient.post<{ success: boolean; user: BackendUser }>(
      '/api/withdrawals',
      { amount },
    ),
  getStatuses: () =>
    apiClient.get<BackendWithdrawalStatus[]>('/api/withdrawals/statuses'),
}

// ─── Referral statuses (real backend, May 2026) ─────────────
export const referralApi = {
  getStatuses: () =>
    apiClient.get<BackendReferralStatus[]>('/api/referral/statuses'),

  // GET /api/referral/page — promo content (title/description/video) for the
  // "Пригласи друга" hero. Response is a bare object (not wrapped in {data}).
  getPage: () =>
    apiClient.get<BackendReferralPage>('/api/referral/page'),
}
