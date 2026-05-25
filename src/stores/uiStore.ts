import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '@/api/locale'

interface UiStore {
  activeTab: string
  isLowPerformanceMode: boolean
  language: Lang
  setActiveTab: (tab: string) => void
  setLowPerformanceMode: (value: boolean) => void
  setLanguage: (lang: Lang) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      activeTab: '/',
      isLowPerformanceMode: false,
      language: (localStorage.getItem('i18nextLng') === 'uz' ? 'uz' : 'ru'),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setLowPerformanceMode: (value) => set({ isLowPerformanceMode: value }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ language: state.language }),
    },
  ),
)
