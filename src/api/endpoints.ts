import apiClient from './client'
import type {
  ApiResponse,
  AuthRequest,
  AuthResponse,
  Category,
  Course,
  CourseDetail,
  CargoService,
  CargoType,
  Factory,
  WholesaleSeller,
  ChinaGuideItem,
  ChinaGuideType,
  Job,
  DesignService,
  DesignServiceType,
  ApiDocument,
  ExchangeRatesResponse,
  MarketboxEvent,
  NewsArticle,
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
  Subscription,
} from './types'

// ─── Auth ───────────────────────────────────────────────────

export const authApi = {
  loginWithTelegram: (data: AuthRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/telegram', data),
}

// ─── User ───────────────────────────────────────────────────

export const userApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<UserProfile>>('/api/user/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<ApiResponse<UserProfile>>('/api/user/me', data),

  getSubscription: () =>
    apiClient.get<ApiResponse<Subscription>>('/api/subscription'),
}

// ─── Categories ─────────────────────────────────────────────

export const categoriesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Category[]>>('/api/categories'),
}

// ─── Courses ────────────────────────────────────────────────

export const coursesApi = {
  getList: (params?: PaginationParams & { marketplace?: string }) =>
    apiClient.get<ApiResponse<Course[]>>('/api/courses', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<CourseDetail>>(`/api/courses/${id}`),
}

// ─── Cargo ──────────────────────────────────────────────────

export const cargoApi = {
  getList: (params?: PaginationParams & { type?: CargoType }) =>
    apiClient.get<ApiResponse<CargoService[]>>('/api/cargo', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<CargoService>>(`/api/cargo/${id}`),
}

// ─── Factories ──────────────────────────────────────────────

export const factoriesApi = {
  getList: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<Factory[]>>('/api/factories', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Factory>>(`/api/factories/${id}`),
}

// ─── Wholesale ──────────────────────────────────────────────

export const wholesaleApi = {
  getList: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<WholesaleSeller[]>>('/api/wholesale', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<WholesaleSeller>>(`/api/wholesale/${id}`),
}

// ─── China Guide ────────────────────────────────────────────

export const chinaGuideApi = {
  getByType: (type: ChinaGuideType, params?: PaginationParams) =>
    apiClient.get<ApiResponse<ChinaGuideItem[]>>(`/api/china-guide/${type}`, { params }),

  getById: (type: ChinaGuideType, id: string) =>
    apiClient.get<ApiResponse<ChinaGuideItem>>(`/api/china-guide/${type}/${id}`),
}

// ─── Jobs ───────────────────────────────────────────────────

export const jobsApi = {
  getList: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<Job[]>>('/api/jobs', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Job>>(`/api/jobs/${id}`),
}

// ─── Design Services ────────────────────────────────────────

export const designServicesApi = {
  getList: (params?: PaginationParams & { type?: DesignServiceType }) =>
    apiClient.get<ApiResponse<DesignService[]>>('/api/design-services', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<DesignService>>(`/api/design-services/${id}`),
}

// ─── Documents ──────────────────────────────────────────────

export const documentsApi = {
  getList: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<ApiDocument[]>>('/api/documents', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<ApiDocument>>(`/api/documents/${id}`),
}

// ─── Exchange ───────────────────────────────────────────────

export const exchangeApi = {
  getRates: () =>
    apiClient.get<ApiResponse<ExchangeRatesResponse>>('/api/exchange/rates'),
}

// ─── Events ─────────────────────────────────────────────────

export const eventsApi = {
  getList: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<MarketboxEvent[]>>('/api/events', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<MarketboxEvent>>(`/api/events/${id}`),
}

// ─── News ───────────────────────────────────────────────────

export const newsApi = {
  getList: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<NewsArticle[]>>('/api/news', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<NewsArticle>>(`/api/news/${id}`),
}

// ─── Favorites ──────────────────────────────────────────────

export const favoritesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<FavoriteItem[]>>('/api/favorites'),

  add: (data: AddFavoriteRequest) =>
    apiClient.post<ApiResponse<FavoriteItem>>('/api/favorites', data),

  remove: (id: string) =>
    apiClient.delete(`/api/favorites/${id}`),
}

// ─── Money ──────────────────────────────────────────────────

export const moneyApi = {
  getBalance: () =>
    apiClient.get<ApiResponse<MoneyBalance>>('/api/money/balance'),

  getTransactions: (params?: PaginationParams) =>
    apiClient.get<ApiResponse<Transaction[]>>('/api/money/transactions', { params }),

  withdraw: (data: WithdrawRequest) =>
    apiClient.post<ApiResponse<WithdrawResponse>>('/api/money/withdraw', data),

  getReferralStats: () =>
    apiClient.get<ApiResponse<ReferralStats>>('/api/money/referral'),
}
