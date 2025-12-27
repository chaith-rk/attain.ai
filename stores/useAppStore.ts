import { create } from 'zustand'

interface AppState {
  selectedGoalId: string | null
  setSelectedGoalId: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedGoalId: null,
  setSelectedGoalId: (id) => set({ selectedGoalId: id }),
}))
