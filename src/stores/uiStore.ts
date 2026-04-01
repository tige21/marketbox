import { create } from 'zustand'

interface UiStore {
  activeTab: string
  isLowPerformanceMode: boolean
  setActiveTab: (tab: string) => void
  setLowPerformanceMode: (value: boolean) => void
}

export const useUiStore = create<UiStore>((set) => ({
  activeTab: '/',
  isLowPerformanceMode: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLowPerformanceMode: (value) => set({ isLowPerformanceMode: value }),
}))
