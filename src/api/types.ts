import type { Localized } from './locale'

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
// Raw backend entities (Localized text via pickLocale())
// Shape comes from https://marketandbox.ru/api/docs
// ============================================================

export interface BackendDocumentation {
  id: number
  title: Localized
  image: Localized
  created_at: string
  updated_at: string
}

export interface BackendCandidate {
  id: number
  name: Localized
  surname: Localized
  photo: Localized
  age: number
  address: Localized
  ability: Localized
  experience: Localized
  preview_text: Localized
  url: string
  title_url: Localized
  is_verify: 0 | 1 | boolean
  created_at: string
  updated_at: string
}

export interface BackendDocumentationCandidate extends BackendCandidate {
  documentation_id: number
}

export interface BackendArticle {
  id: number
  title: Localized
  image: Localized
  preview_text: Localized
  content: Localized
  date: string
  url: string
  title_url: Localized
  created_at: string
  updated_at: string
}

// ─── Subscription contest gifts (GET /api/subscription-gifts) ───────────────
// Backend already localizes `title`/`description` by the `lang` request header,
// so they arrive as plain strings (not Localized).
export interface BackendSubscriptionGift {
  id: number
  title: string
  description: string
  /** Full image URL (may be empty → BackendImage shows a placeholder). */
  image: string
  /** Position in the unlock ladder (sort ascending). */
  order: number
  /** Whether this gift is already unlocked for the current user. */
  is_passed: boolean
}

export interface SubscriptionGiftsResponse {
  data: BackendSubscriptionGift[]
  /** Consecutive subscription months = number of unlocked gifts. */
  passed_count: number
}

export interface BackendCourse {
  id: number
  title: Localized
  image: Localized
  url: string | null
  title_url: Localized | null
  preview_text: Localized
  description: Localized
  /** Telegram chat link for this course (added May 2026). */
  chat_url?: string | null
}

// GET /api/referral/page — promo content for the "Пригласи друга" screen.
// Swagger types the text fields as plain `string` (backend likely localizes
// server-side via the `lang` header), but every other content endpoint uses
// `Localized`, so we tolerate both shapes and resolve at the call site.
export interface BackendReferralPage {
  id: number
  title: Localized | string
  preview_text: Localized | string
  description: Localized | string
  /** Kinescope/YouTube URL for the inline player. */
  video_url: string | null
  /** Poster shown before the video plays. */
  video_preview: string | null
}

export interface BackendCargoTeamMember {
  fio: Localized
  position: Localized
  experience: Localized | null
  photo: Localized
}

export interface BackendCargo {
  id: number
  title: Localized
  /** Brand/company name shown on the About card (e.g. "Wave Logistic"). */
  company_name?: Localized | null
  preview_text: Localized
  image: Localized
  description: Localized
  team: BackendCargoTeamMember[]
  phone: string | null
  email: string | null
  site: string | null
  /** Telegram chat link for this cargo (added May 2026). */
  chat_url?: string | null
  /** Cargo type from backend enum: WHITE | COMPANY | FULFILLMENT. */
  type?: string
  /** Social network links shown on the white-cargo detail page. */
  socials?: Array<{ type: string; url: string }>
}

export interface BackendLesson {
  id: number
  type: string
  title: Localized
  image: Localized | null
  preview_text: Localized
  description: Localized
  morphable_type?: string
  morphable_id?: number
  // Backend will start sending one of these for the lesson player.
  // `video_url` is preferred (e.g. https://kinescope.io/iUKdgKCmcXvGRbQdXPYBN9);
  // `embed_html` is the raw <iframe …> snippet from Kinescope/YouTube.
  video_url?: string | null
  /** Poster/thumbnail image shown before video plays (added May 2026). */
  video_preview?: string | null
  embed_html?: string | null
  duration?: string | null
  // Legacy frontend shape; kept for back-compat.
  materials?: Array<{ name: string; url: string; size?: string | null }>
  // New canonical shape from Swagger — array of document URLs.
  documents?: string[]
  /** Whether this lesson is unlocked for the current user. */
  is_accessible?: boolean
}

export interface BackendCargoInfo {
  cargo: BackendCargo
  lessons: BackendLesson[]
  logistics: BackendCargoLogistic[]
  fulfillment: BackendCargoLogistic[]
}

export interface BackendCourseLesson {
  id: number
  title: Localized
  image: Localized | null
  course_id?: number
  module_id?: number
  created_at?: string
  updated_at?: string
  preview_text?: Localized
  description?: Localized
  // Video player fields — backend will start sending these:
  video_url?: string | null
  /** Poster/thumbnail image shown before video plays (added May 2026).
   * Mirrors BackendLesson.video_preview — the uploaded video cover. */
  video_preview?: string | null
  embed_html?: string | null
  duration?: string | null
  // Legacy: prior `materials` array. New backend ships a flat `documents`
  // array of URLs; LessonDetailPage maps them onto the same UI.
  materials?: Array<{ name: string; url: string; size?: string | null }>
  documents?: string[]
  /** Whether this lesson is unlocked for the current user. */
  is_accessible?: boolean
}

// Backend now intermediates between Course and Lesson with a Module
// resource. Per Swagger:
//   GET /courses/{course}/modules → Module[]
//   GET /modules/{module}/lessons → Lesson[]
export interface BackendModule {
  id: number
  course_id?: number
  title: Localized
  image: Localized | null
  url?: string | null
  title_url?: Localized | null
  preview_text?: Localized
  description?: Localized
  /** Display order = the module's "level". Lower unlocks first. */
  order?: number
  /** Whether this module is unlocked for the current user. Source of truth
   * for gating — the backend computes it from the subscription level. */
  is_accessible?: boolean
}

export type CargoLogisticKind = 1 | 2 // 1 = logistics, 2 = fulfillment

export interface BackendCargoLogistic {
  id: number
  title: Localized
  image: Localized
  type: CargoLogisticKind
  cargo_id: number | null
  url: string
  title_url: Localized
  preview_text: Localized
  /** Full text for the in-app detail page (added May 2026). */
  description: Localized | null
  flags: string[]
  /** Optional contact fields (admin may populate later). Detail page
   * renders rows conditionally based on which are non-null. */
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  created_at?: string
  updated_at?: string
}

// ─── Events / News-like ─────────────────────────────────────
// `/api/events` returns plain strings — the backend does not localize
// this resource (verified live). Optional `created_at` / `updated_at`
// because the swagger schema marks the whole shape as `nullable: true`
// at the field level.

export interface BackendEvent {
  id: number
  title: string
  preview_text: string
  /** Full text for the in-app detail page (added May 2026). */
  description: string | null
  image: string
  date: string
  type: string
  url: string | null
  title_url: string | null
  created_at?: string
  updated_at?: string
}

// ─── Sellers (wholesale) ────────────────────────────────────

export interface BackendSeller {
  id: number
  title: Localized
  image: Localized
  address: Localized
  url: string
  title_url: Localized
  created_at: string
  updated_at: string
}

// ─── Jobs (Work + Candidate) ────────────────────────────────

export interface BackendWork {
  id: number
  title: Localized
  created_at: string
  updated_at: string
}

export interface BackendWorkCandidate extends BackendCandidate {
  work_id: number
}

// ─── Design services + design candidates ────────────────────

export interface BackendDesignServiceInfo {
  id: number
  title: Localized
  created_at: string
  updated_at: string
}

export interface BackendDesignCandidate extends BackendCandidate {
  design_service_id: number
}

// ─── China Guide (5 entity types) ───────────────────────────

export interface BackendGuid {
  id: number
  title: Localized
  preview_text: Localized
  image: Localized
  created_at: string
  updated_at: string
}

interface BackendGuideBase {
  id: number
  title: Localized
  title_short: Localized
  address: Localized
  image: Localized
  description: Localized
  guid_id: number | null
  baidu_url: string | null
  apple_map_url: string | null
  /** Optional event/availability date set in admin (e.g. "2026-04-30"). */
  date?: string | null
  /** Optional external URL set in admin (booking page, website). */
  url?: string | null
  created_at: string
  updated_at: string
}

export interface BackendMarket extends BackendGuideBase {}
export interface BackendHotel extends BackendGuideBase {}
export interface BackendRestaurant extends BackendGuideBase {
  grade: number | string
}

export interface BackendTour {
  id: number
  title: Localized
  address: Localized
  image: Localized
  preview_text: Localized
  /** Full text for the in-app detail page (added May 2026). */
  description: Localized | null
  date: string
  guid_id: number | null
  url: string
  title_url: Localized
  created_at?: string
  updated_at?: string
}

export interface BackendTranslator {
  id: number
  name: Localized
  surname: Localized
  photo: Localized
  age: number
  address: Localized
  hometown: Localized
  languages: Array<{ title: Localized }>
  preview_text: Localized
  about_me: Localized
  can_help: Array<{ title: Localized }>
  guid_id: number | null
  url: string
  title_url: Localized | null
  is_verify: 0 | 1 | boolean
  created_at?: string
  updated_at?: string
}

// ─── Factories (3-level) ────────────────────────────────────

export interface BackendFabric {
  id: number
  title: Localized
  image: Localized
  /** Telegram chat link for this country's fabric chat (added May 2026). */
  chat_url?: string | null
  /** Whether to show the WeChat block on companies in this fabric. */
  wechat?: boolean
  created_at?: string
  updated_at?: string
}

export interface BackendFabricSection {
  id: number
  title: Localized
  image: Localized
  fabric_id: number
  created_at: string
  updated_at: string
}

export interface BackendCompany {
  id: number
  title: Localized
  image: Localized
  fabric_section_id: number
  fabric_id?: number
  url: string | null
  title_url: Localized | null
  preview_description: Localized
  /** Full text for the in-app detail page (added May 2026). */
  description: Localized | null
  /** WeChat QR-code image URL (null if not uploaded by backend yet). */
  qr_code: Localized | string | null
  /** Optional contact fields (may be added by admin later). The detail
   * page renders rows conditionally based on which of these are non-null. */
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  created_at?: string
  updated_at?: string
}

// ─── Menu (not used for home categories — data mismatched) ──

export type MenuType =
  | 'course'
  | 'fabric'
  | 'cargo'
  | 'seller'
  | 'guid'
  | 'work'
  | 'design'
  | 'documentation'
  | 'exchange'
  | 'event'
  | 'article'

export interface BackendMenuInfo {
  id: number
  title: Localized
  preview_text: Localized
  preview_image: Localized
  type: MenuType | string
  created_at?: string
  updated_at?: string
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
  /** Backend subscription type. `standard` unlocks modules progressively;
   * `full_access` unlocks everything at once. Informational only — module
   * gating uses each module's `is_accessible`. */
  type?: 'standard' | 'full_access' | null
  /** Highest module `order` level the user has unlocked (standard plans). */
  unlockedModuleLevel?: number | null
  /** How many months in a row the user has held an active subscription.
   * Drives the home-header contest progress ("N/12" + prize unlocks). */
  consecutiveMonths?: number | null
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
  titleSize?: 'lg' | 'md' | 'sm'
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
  // Market-specific deep links for route-building
  baiduUrl?: string
  appleUrl?: string
  /** Optional secondary-line short description shown on cards (city, tagline, etc.). */
  shortDesc?: string
  /** External URL (tours, translators, etc.) to open on card tap. */
  externalUrl?: string
}

// ============================================================
// Jobs
// ============================================================

export type JobType = 'full-time' | 'part-time' | 'remote' | 'freelance'
export type JobMarketplace = 'ozon' | 'wildberries' | 'uzum'

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
  // Candidate-profile fields (Figma 1048:13050 — "Работа" / manager cards)
  name?: string
  age?: number
  city?: string
  specialization?: string
  experience?: string
  photoUrl?: string
  marketplace?: JobMarketplace
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

export type EventType = 'exhibition' | 'event' | 'conference' | 'webinar' | 'meetup'

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
  /** Optional call-to-action label shown on the card footer pill. */
  ctaText?: string
  /** Optional external URL opened when the CTA pill is tapped. */
  ctaUrl?: string
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
  /** Optional call-to-action label shown on the card footer pill. Defaults to "УЧАСТВОВАТЬ". */
  ctaText?: string
  /** Optional external URL opened when the CTA pill is tapped. */
  ctaUrl?: string
  /** Optional short date label shown in the purple badge ("15 МАЯ"). */
  badgeDate?: string
  /** Optional highlighted vendor phrase (e.g. "UZUM MARKET"). */
  highlight?: string
  /** Optional Uzbek variant of `highlight`. */
  highlightUz?: string
}

// ============================================================
// User Profile
// ============================================================

// Raw shape returned by the real `/api/me` endpoint. Shape matches the
// Swagger `User` schema: only `telegram_*` snake_case fields are
// guaranteed; phone/language/subscription are not yet provided.
// Real backend transaction (May 2026). Currently only minimal shape;
// `body` is server-side description (likely JSON or plain text).
export interface BackendTransaction {
  id: number
  user_id?: number
  body?: string
}

export interface BackendReferralStatus {
  id: number
  title: string
  /** Earnings percentage for this status tier (5/10/15). */
  percentage: number
}

export interface BackendUser {
  id: number
  name?: string
  /** User-editable surname. Set via PUT /user?surname=... */
  surname?: string
  email?: string
  telegram_id?: number
  telegram_username?: string
  telegram_first_name?: string
  telegram_last_name?: string
  telegram_photo_url?: string
  /** User's own referral code — share this to invite. */
  referral_code?: string
  /** Untouched balance available for withdrawal. */
  balance?: number
  /** Total invited friends. */
  referrals_count?: number
  /** Of those, how many are "active" (paid plan, etc.). */
  referrals_count_active?: number
  /** Sum currently in pending state. */
  pending?: number
  /** Sum that ended up rejected. */
  rejected?: number
  /** Current referral tier (basic/partner/top). */
  referral_status?: BackendReferralStatus
}

export interface BackendWithdrawalStatus {
  code: 'approved' | 'pending' | 'rejected' | string
  title: string
}

export interface BackendWithdrawal {
  id: number
  amount: number
  status: 'approved' | 'pending' | 'rejected' | string
  created_at?: string
  updated_at?: string
}

// UI-facing camelCase shape consumed by ProfileMain / ProfileEditPage.
// Stays superset of the backend response: optional fields are tolerated
// on screens that don't need them yet.
export interface UserProfile {
  id: number
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
  phone?: string
  email?: string
  languageCode: 'ru' | 'uz'
  subscription: Subscription
  /** Финансы и рефералка (приходят из /api/user). */
  referralCode?: string
  balance?: number
  referralsCount?: number
  referralsCountActive?: number
  pendingAmount?: number
  rejectedAmount?: number
  referralStatus?: BackendReferralStatus
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
