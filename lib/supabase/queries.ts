import { createClient } from './client'
import type { Goal, GoalDay, Message } from '@/types'

// Goals
export async function fetchGoals(): Promise<Goal[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createGoal(
  title: string,
  description: string | null
): Promise<Goal> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title,
      description,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGoal(goalId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)

  if (error) throw error
}

// Goal Days
export async function fetchGoalDays(goalId: string): Promise<GoalDay[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('goal_days')
    .select('*')
    .eq('goal_id', goalId)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createGoalDays(goalId: string, dates: string[]): Promise<GoalDay[]> {
  const supabase = createClient()

  const rows = dates.map(date => ({
    goal_id: goalId,
    date,
    intent: null,
    action: null,
    notes: null,
  }))

  const { data, error } = await supabase
    .from('goal_days')
    .insert(rows)
    .select()

  if (error) throw error
  return data || []
}

export async function updateGoalDay(
  goalDayId: string,
  updates: Partial<Pick<GoalDay, 'intent' | 'action' | 'notes'>>
): Promise<GoalDay> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('goal_days')
    .update(updates)
    .eq('id', goalDayId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Combined: Create goal with 7 days
export async function createGoalWithDays(
  title: string,
  description: string | null
): Promise<{ goal: Goal; goalDays: GoalDay[] }> {
  const goal = await createGoal(title, description)

  // Generate 7 days (yesterday + today + next 5 days)
  const dates: string[] = []
  const today = new Date()
  for (let i = -1; i < 6; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
  }

  const goalDays = await createGoalDays(goal.id, dates)

  return { goal, goalDays }
}

// Messages
export async function fetchMessages(goalId: string): Promise<Message[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createMessage(
  goalId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id: user.id,
      goal_id: goalId,
      role,
      content,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
