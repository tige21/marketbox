import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TgUser, Subscription } from '@/api/types'
import { setAuthToken, clearAuthToken } from '@/api/client'

export type AuthState = 'loading' | 'ok' | 'error' | 'non-telegram'

interface AuthStore {
  authState: AuthState
  token: string | null
  user: TgUser | null
  isPremium: boolean
  subscriptionExpiry: string | null
  errorDetail: string | null
  /** True iff this session was hydrated from localStorage (no fresh handshake yet). */
  hasHydratedSession: boolean
  setAuth: (token: string, user: TgUser, subscription: Subscription) => void
  /** Patch a few fields on the current user (e.g. after profile edit). */
  patchUser: (patch: Partial<TgUser>) => void
  setError: (detail?: string) => void
  /** Soft error: we still have a cached session, but the latest handshake failed. */
  setSoftError: (detail: string | null) => void
  setNonTelegram: () => void
  setLoading: () => void
  clear: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      authState: 'loading',
      token: null,
      user: null,
      isPremium: false,
      subscriptionExpiry: null,
      errorDetail: null,
      hasHydratedSession: false,

      setAuth: (token, user, subscription) => {
        setAuthToken(token)
        set({
          authState: 'ok',
          token,
          user,
          isPremium: subscription.isPremium,
          subscriptionExpiry: subscription.expiresAt,
          errorDetail: null,
          hasHydratedSession: true,
        })
      },

      patchUser: (patch) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        }))
      },

      setError: (detail?: string) => {
        clearAuthToken()
        set({
          authState: 'error',
          token: null,
          user: null,
          isPremium: false,
          errorDetail: detail ?? null,
        })
      },

      // Background refresh failed but cache is still valid — keep using
      // the persisted session, just record the error so the user can see
      // and copy it from Profile and retry.
      setSoftError: (detail) => {
        set({ errorDetail: detail })
      },

      setNonTelegram: () => {
        set({ authState: 'non-telegram', token: null, user: null, isPremium: false, errorDetail: null })
      },

      setLoading: () => {
        set({ authState: 'loading', errorDetail: null })
      },

      clear: () => {
        clearAuthToken()
        set({
          authState: 'loading',
          token: null,
          user: null,
          isPremium: false,
          subscriptionExpiry: null,
          errorDetail: null,
          hasHydratedSession: false,
        })
      },
    }),
    {
      name: 'auth-store',
      // Bumped from v1 → v2 to wipe the legacy GUEST_SESSION mock
      // (BORIGA BARAKA + /images/home/avatar.png) that earlier builds
      // wrote into localStorage as a fallback. zustand discards any
      // persisted state with a different version number.
      version: 2,
      // Cache the *session* across reloads so the header doesn't flash
      // before the TG handshake completes. authState stays out of
      // persist so we always start in 'loading' and let AuthProvider
      // decide whether to show 'ok' (cache hit) or run the handshake.
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isPremium: state.isPremium,
        subscriptionExpiry: state.subscriptionExpiry,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, restore the axios default Authorization
        // header so any request fired before AuthProvider's effect runs
        // (e.g. data fetchers attached to lazy routes) carries the token.
        if (state?.token) {
          setAuthToken(state.token)
          state.hasHydratedSession = true
        }
      },
    },
  ),
)
