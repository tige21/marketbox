// ============================================================
// Standard response wrappers
// ============================================================

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}

export interface PaginationParams {
  page?: number
  perPage?: number
}

// ============================================================
// Auth
// ============================================================

export interface TgUser {
  id: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
  languageCode?: string
}

export interface Subscription {
  isPremium: boolean
  expiresAt: string | null
  plan: 'free' | 'premium'
}

export interface AuthResponse {
  token: string
  user: TgUser
  subscription: Subscription
}

export interface AuthRequest {
  initData: string
}

// ============================================================
// Categories
// ============================================================

export interface Category {
  id: string
  slug: string
  title: string
  titleUz: string
  description: string
  descriptionUz: string
  imageUrl: string
  route: string
  isPremium: boolean
  isActive: boolean
  order: number
}

// ============================================================
// Courses
// ============================================================

export type CourseMarketplace = 'ozon' | 'wildberries' | 'uzum'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Course {
  id: string
  title: string
  titleUz: string
  description: string
  descriptionUz: string
  marketplace: CourseMarketplace
  level: CourseLevel
  price: number
  currency: string
  duration: number
  lessonsCount: number
  imageUrl: string
  authorName: string
  authorAvatar?: string
  rating: number
  reviewsCount: number
  isPremium: boolean
  isEnrolled: boolean
  createdAt: string
}

export interface CourseDetail extends Course {
  syllabus: string[]
  whatYouLearn: string[]
  requirements: string[]
}

// ============================================================
// Cargo
// ============================================================

export type CargoType = 'white' | 'black' | 'fulfillment'

export interface CargoService {
  id: string
  type: CargoType
  companyName: string
  companyNameUz: string
  description: string
  descriptionUz: string
  pricePerKg: number
  currency: string
  deliveryDays: string
  logoUrl: string
  phone: string
  telegram: string
  rating: number
  reviewsCount: number
  isPremium: boolean
  isVerified: boolean
  countries?: string
}

// ============================================================
// Factories
// ============================================================

export interface Factory {
  id: string
  name: string
  nameUz: string
  description: string
  descriptionUz: string
  country: string
  city: string
  categories: string[]
  minOrderQuantity: number
  currency: string
  imageUrl: string
  phone: string
  telegram: string
  website?: string
  rating: number
  reviewsCount: number
  isPremium: boolean
  isVerified: boolean
}

// ============================================================
// Wholesale
// ============================================================

export interface WholesaleSeller {
  id: string
  name: string
  nameUz: string
  description: string
  descriptionUz: string
  categories: string[]
  minOrderAmount: number
  currency: string
  city: string
  address: string
  imageUrl: string
  phone: string
  telegram: string
  rating: number
  reviewsCount: number
  isPremium: boolean
  isVerified: boolean
}

// ============================================================
// China Guide
// ============================================================

export type ChinaGuideType = 'markets' | 'restaurants' | 'hotels' | 'tours' | 'translators'

export interface ChinaGuideItem {
  id: string
  type: ChinaGuideType
  name: string
  nameUz: string
  description: string
  descriptionUz: string
  city: string
  address: string
  phone?: string
  wechat?: string
  imageUrl: string
  rating: number
  reviewsCount: number
  priceRange: string
  workingHours?: string
  isPremium: boolean
  coordinates?: {
    lat: number
    lng: number
  }
  // Tour-specific fields
  tourDate?: string
  maxParticipants?: number
  // Translator-specific fields
  age?: number
  languages?: string[]
  origin?: string
  aboutMe?: string
  canHelp?: string[]
  isVerified?: boolean
}

// ============================================================
// Jobs
// ============================================================

export type JobType = 'full-time' | 'part-time' | 'remote' | 'freelance'

export interface Job {
  id: string
  title: string
  titleUz: string
  description: string
  descriptionUz: string
  companyName: string
  companyLogo?: string
  type: JobType
  location: string
  salary: string
  currency: string
  categories: string[]
  requirements: string[]
  telegram: string
  phone?: string
  isPremium: boolean
  isActive: boolean
  isVerified: boolean
  createdAt: string
  expiresAt?: string
}

// ============================================================
// Design Services
// ============================================================

export type DesignServiceType = 'webdesign' | 'infograph' | 'photographer'

export interface DesignService {
  id: string
  type: DesignServiceType
  name: string
  nameUz: string
  description: string
  descriptionUz: string
  portfolioImages: string[]
  priceFrom: number
  currency: string
  telegram: string
  instagram?: string
  rating: number
  reviewsCount: number
  completedProjects: number
  isPremium: boolean
  age: number
  city: string
  experienceYears: string
  isVerified: boolean
}

// ============================================================
// Documents
// NOTE: Named ApiDocument to avoid conflict with the DOM built-in Document type
// ============================================================

export type DocumentCategory = 'contracts' | 'certificates' | 'guides' | 'templates'

export interface ApiDocument {
  id: string
  title: string
  titleUz: string
  description: string
  descriptionUz: string
  category: DocumentCategory
  fileUrl: string
  fileSize: string
  fileType: 'pdf' | 'docx' | 'xlsx'
  downloadCount: number
  isPremium: boolean
  createdAt: string
}

// ============================================================
// Exchange Rates
// ============================================================

export interface ExchangeRate {
  currency: string
  code: string
  buyRate: number
  sellRate: number
  centralBankRate?: number
  change?: number
  updatedAt: string
}

export interface ExchangeRatesResponse {
  rates: ExchangeRate[]
  baseCurrency: string
  updatedAt: string
}

// ============================================================
// Events
// NOTE: Named MarketboxEvent to avoid conflict with the DOM built-in Event type
// ============================================================

export type EventType = 'exhibition' | 'conference' | 'webinar' | 'meetup'

export interface MarketboxEvent {
  id: string
  title: string
  titleUz: string
  description: string
  descriptionUz: string
  type: EventType
  location: string
  isOnline: boolean
  startDate: string
  endDate: string
  price: number
  currency: string
  imageUrl: string
  organizerName: string
  organizerTelegram: string
  registrationUrl?: string
  isPremium: boolean
  isFeatured: boolean
}

// ============================================================
// News
// ============================================================

export type NewsCategory = 'marketplace' | 'cargo' | 'business' | 'china' | 'general'

export interface NewsArticle {
  id: string
  title: string
  titleUz: string
  summary: string
  summaryUz: string
  content: string
  contentUz: string
  category: NewsCategory
  imageUrl: string
  authorName: string
  viewsCount: number
  publishedAt: string
  isFeatured: boolean
}

// ============================================================
// User Profile
// ============================================================

export interface UserProfile {
  id: number
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
  phone?: string
  languageCode: 'ru' | 'uz'
  subscription: Subscription
  createdAt: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phone?: string
  languageCode?: 'ru' | 'uz'
}

// ============================================================
// Favorites
// ============================================================

export type FavoriteItemType = 'course' | 'cargo' | 'factory' | 'wholesale' | 'job' | 'event'

export interface FavoriteItem {
  id: string
  itemId: string
  itemType: FavoriteItemType
  title: string
  imageUrl: string
  addedAt: string
}

export interface AddFavoriteRequest {
  itemId: string
  itemType: FavoriteItemType
}

// ============================================================
// Money
// ============================================================

export type TransactionType = 'credit' | 'debit'
export type TransactionStatus = 'completed' | 'pending' | 'failed'

export interface MoneyBalance {
  amount: number
  currency: string
  updatedAt: string
  availableAmount?: number
  pendingAmount?: number
}

export interface ReferralStats {
  link: string
  invitedCount: number
  activeCount: number
  percentage: number
  status: 'basic' | 'partner' | 'top'
}

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  currency: string
  description: string
  descriptionUz: string
  createdAt: string
}

export interface WithdrawRequest {
  amount: number
  currency: string
  cardNumber: string
}

export interface WithdrawResponse {
  transactionId: string
  status: TransactionStatus
  message: string
}
