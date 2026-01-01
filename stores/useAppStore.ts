import { create } from 'zustand'
import type { Goal, GoalDay, Message } from '@/types'

interface AppState {
  // Goals
  goals: Goal[]
  goalsLoading: boolean
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  removeGoal: (goalId: string) => void
  setGoalsLoading: (loading: boolean) => void

  // Selected goal
  selectedGoalId: string | null
  setSelectedGoalId: (id: string | null) => void

  // Goal days for selected goal
  goalDays: GoalDay[]
  goalDaysLoading: boolean
  setGoalDays: (goalDays: GoalDay[]) => void
  updateGoalDayInStore: (goalDay: GoalDay) => void
  setGoalDaysLoading: (loading: boolean) => void

  // Messages for selected goal
  messages: Message[]
  messagesLoading: boolean
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setMessagesLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Goals
  goals: [],
  goalsLoading: true,
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  removeGoal: (goalId) => set((state) => ({
    goals: state.goals.filter(g => g.id !== goalId),
    selectedGoalId: state.selectedGoalId === goalId ? null : state.selectedGoalId,
  })),
  setGoalsLoading: (loading) => set({ goalsLoading: loading }),

  // Selected goal
  selectedGoalId: null,
  setSelectedGoalId: (id) => set({ selectedGoalId: id }),

  // Goal days
  goalDays: [],
  goalDaysLoading: false,
  setGoalDays: (goalDays) => set({ goalDays }),
  updateGoalDayInStore: (goalDay) => set((state) => ({
    goalDays: state.goalDays.map(gd => gd.id === goalDay.id ? goalDay : gd),
  })),
  setGoalDaysLoading: (loading) => set({ goalDaysLoading: loading }),

  // Messages
  messages: [],
  messagesLoading: false,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessagesLoading: (loading) => set({ messagesLoading: loading }),
}))
