export interface UserProfile {
  id: string
  timezone: string
  chat_summaries: Record<string, string>
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface GoalDay {
  id: string
  goal_id: string
  date: string
  intent: string | null
  action: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  goal_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
