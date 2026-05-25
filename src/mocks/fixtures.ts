// Seed data for the eight stub-mocked endpoints (auth, user/me,
// subscription, favorites, money/{balance,transactions,referral}, exchange).
// Everything else hits the real backend.

import type {
  TgUser,
  Subscription,
  ExchangeRate,
  UserProfile,
  FavoriteItem,
  MoneyBalance,
  Transaction,
  ReferralStats,
} from '../api/types'

// ─── Auth ───────────────────────────────────────────────────

export const mockUser: TgUser = {
  id: 123456789,
  firstName: 'BORIGA',
  lastName: 'BARAKA',
  username: 'boriga_baraka',
  photoUrl: '/app/images/home/avatar.png',
  languageCode: 'ru',
}

export const mockSubscription: Subscription = {
  isPremium: true,
  expiresAt: '2026-04-16T12:00:00Z',
  plan: 'premium',
}

// ─── Exchange (safety-net; usually shadowed by Fawaz API) ───

export const mockExchangeRates: ExchangeRate[] = [
  { currency: 'Узбекский сум', code: 'UZS', buyRate: 4244.43, sellRate: 4244.43, change: 3.2, updatedAt: new Date().toISOString() },
  { currency: 'Российский рубль', code: 'RUB', buyRate: 4244.43, sellRate: 4244.43, change: 3.2, updatedAt: new Date().toISOString() },
  { currency: 'Турецкая лира', code: 'TRY', buyRate: 4244.43, sellRate: 4244.43, change: -1.2, updatedAt: new Date().toISOString() },
  { currency: 'Доллар США', code: 'USD', buyRate: 4244.43, sellRate: 4244.43, centralBankRate: 12850, change: 3.2, updatedAt: new Date().toISOString() },
  { currency: 'Китайский юань', code: 'CNY', buyRate: 4244.43, sellRate: 4244.43, change: 3.2, updatedAt: new Date().toISOString() },
  { currency: 'Киргизский сом', code: 'KGS', buyRate: 4244.43, sellRate: 4244.43, change: 3.2, updatedAt: new Date().toISOString() },
]

// ─── User profile ───────────────────────────────────────────

export const mockUserProfile: UserProfile = {
  id: 123456789,
  telegramId: 123456789,
  firstName: 'Муродали',
  lastName: 'Махмутов',
  username: 'boriga_baraka',
  photoUrl: '/app/images/profile/profile-avatar.jpg',
  phone: '+998901234567',
  languageCode: 'ru',
  subscription: mockSubscription,
  createdAt: '2026-01-01T00:00:00Z',
}

// ─── Favorites (empty seed; user adds via heart button) ─────

export const mockFavorites: FavoriteItem[] = []

// ─── Money ──────────────────────────────────────────────────

export const mockBalance: MoneyBalance = {
  amount: 500,
  currency: '₽',
  updatedAt: new Date().toISOString(),
  availableAmount: 500,
  pendingAmount: 0,
}

export const mockReferralStats: ReferralStats = {
  link: 'https://t.me/mamaevest_money?start=ref_6348551853',
  invitedCount: 0,
  activeCount: 0,
  percentage: 20,
  status: 'basic',
}

export const mockTransactions: Transaction[] = []
