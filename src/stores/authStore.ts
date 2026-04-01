import { create } from 'zustand'
import type { TgUser, Subscription } from '@/api/types'
import { setAuthToken, clearAuthToken } from '@/api/client'

export type AuthState = 'loading' | 'ok' | 'error' | 'non-telegram'

interface AuthStore {
  authState: AuthState
  token: string | null
  user: TgUser | null
  isPremium: boolean
  subscriptionExpiry: string | null
  setAuth: (token: string, user: TgUser, subscription: Subscription) => void
  setError: () => void
  setNonTelegram: () => void
  clear: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  authState: 'loading',
  token: null,
  user: null,
  isPremium: false,
  subscriptionExpiry: null,

  setAuth: (token, user, subscription) => {
    setAuthToken(token)
    set({
      authState: 'ok',
      token,
      user,
      isPremium: subscription.isPremium,
      subscriptionExpiry: subscription.expiresAt,
    })
  },

  setError: () => {
    clearAuthToken()
    set({ authState: 'error', token: null, user: null, isPremium: false })
  },

  setNonTelegram: () => {
    set({ authState: 'non-telegram', token: null, user: null, isPremium: false })
  },

  clear: () => {
    clearAuthToken()
    set({ authState: 'loading', token: null, user: null, isPremium: false, subscriptionExpiry: null })
  },
}))
