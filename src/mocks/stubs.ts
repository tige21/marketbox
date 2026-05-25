// Stub layer that replaces MSW for the 12 routes the backend doesn't have yet:
//   POST /api/auth/telegram
//   GET  /api/user/me, PUT /api/user/me, GET /api/subscription
//   GET  /api/favorites, POST /api/favorites, DELETE /api/favorites/:id
//   GET  /api/money/{balance,transactions,referral}, POST /api/money/withdraw
//   GET  /api/exchange/rates (safety net; usually shadowed by Fawaz API)
//
// Returns axios-shaped envelopes so endpoints.ts can drop these in for the
// real `apiClient.X()` call when VITE_USE_MOCKS is true. Favorites,
// transactions and profile edits persist across reloads via localStorage.

import type { AxiosResponse } from 'axios'
import {
  mockUser,
  mockSubscription,
  mockExchangeRates,
  mockUserProfile,
  mockFavorites,
  mockBalance,
  mockTransactions,
  mockReferralStats,
} from './fixtures'
import type {
  ApiResponse,
  AuthResponse,
  UserProfile,
  UpdateProfileRequest,
  Subscription,
  FavoriteItem,
  AddFavoriteRequest,
  MoneyBalance,
  Transaction,
  WithdrawRequest,
  WithdrawResponse,
  ReferralStats,
  ExchangeRatesResponse,
} from '../api/types'

const STORAGE_KEY = 'marketbox:mock-state:v1'
const LATENCY_MS = 250

interface PersistedState {
  userProfile: UserProfile
  favorites: FavoriteItem[]
  transactions: Transaction[]
}

function defaultState(): PersistedState {
  return {
    userProfile: { ...mockUserProfile },
    favorites: [...mockFavorites],
    transactions: [...mockTransactions],
  }
}

function loadState(): PersistedState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      userProfile: parsed.userProfile ?? { ...mockUserProfile },
      favorites: parsed.favorites ?? [...mockFavorites],
      transactions: parsed.transactions ?? [...mockTransactions],
    }
  } catch {
    return defaultState()
  }
}

function saveState(s: PersistedState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // ignore quota / private mode errors
  }
}

let state: PersistedState = loadState()

function delay(ms: number = LATENCY_MS): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// Returns the axios envelope shape {data: ApiResponse<T>} via cast. Consumers
// only ever read .data.data, so the missing AxiosResponse fields are unused.
function envelope<T>(data: T): AxiosResponse<ApiResponse<T>> {
  return { data: { data } } as unknown as AxiosResponse<ApiResponse<T>>
}

export const mockApi = {
  async authTelegram(): Promise<AxiosResponse<ApiResponse<AuthResponse>>> {
    await delay()
    return envelope<AuthResponse>({
      token: 'mock-jwt-token-' + Date.now(),
      user: mockUser,
      subscription: mockSubscription,
    })
  },

  async getMe(): Promise<AxiosResponse<ApiResponse<UserProfile>>> {
    await delay()
    return envelope(state.userProfile)
  },

  async updateMe(
    body: UpdateProfileRequest,
  ): Promise<AxiosResponse<ApiResponse<UserProfile>>> {
    await delay()
    state = {
      ...state,
      userProfile: { ...state.userProfile, ...body },
    }
    saveState(state)
    return envelope(state.userProfile)
  },

  async getSubscription(): Promise<AxiosResponse<ApiResponse<Subscription>>> {
    await delay()
    return envelope(mockSubscription)
  },

  async getFavorites(): Promise<AxiosResponse<ApiResponse<FavoriteItem[]>>> {
    await delay()
    return envelope(state.favorites)
  },

  async addFavorite(
    body: AddFavoriteRequest,
  ): Promise<AxiosResponse<ApiResponse<FavoriteItem>>> {
    await delay()
    const fav: FavoriteItem = {
      id: 'fav-' + Date.now(),
      itemId: body.itemId,
      itemType: body.itemType,
      title: 'Item ' + body.itemId,
      imageUrl:
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
      addedAt: new Date().toISOString(),
    }
    state = { ...state, favorites: [...state.favorites, fav] }
    saveState(state)
    return envelope(fav)
  },

  async removeFavorite(
    id: string,
  ): Promise<AxiosResponse<ApiResponse<null>>> {
    await delay()
    state = { ...state, favorites: state.favorites.filter((f) => f.id !== id) }
    saveState(state)
    return envelope(null)
  },

  async getBalance(): Promise<AxiosResponse<ApiResponse<MoneyBalance>>> {
    await delay()
    return envelope(mockBalance)
  },

  async getTransactions(): Promise<AxiosResponse<ApiResponse<Transaction[]>>> {
    await delay()
    return envelope(state.transactions)
  },

  async withdraw(
    body: WithdrawRequest,
  ): Promise<AxiosResponse<ApiResponse<WithdrawResponse>>> {
    await delay()
    const tx: Transaction = {
      id: 'tx-' + Date.now(),
      type: 'debit',
      amount: body.amount,
      currency: body.currency || '₽',
      status: 'pending',
      description: 'Банковская Карта',
      descriptionUz: 'Bank kartasi',
      createdAt: new Date().toISOString(),
    }
    state = { ...state, transactions: [tx, ...state.transactions] }
    saveState(state)
    return envelope<WithdrawResponse>({
      transactionId: tx.id,
      status: 'pending',
      message: 'Заявка на вывод принята',
    })
  },

  async getReferral(): Promise<AxiosResponse<ApiResponse<ReferralStats>>> {
    await delay()
    return envelope(mockReferralStats)
  },

  async getExchangeRates(): Promise<
    AxiosResponse<ApiResponse<ExchangeRatesResponse>>
  > {
    await delay()
    return envelope<ExchangeRatesResponse>({
      rates: mockExchangeRates,
      baseCurrency: 'UZS',
      updatedAt: new Date().toISOString(),
    })
  },
}
