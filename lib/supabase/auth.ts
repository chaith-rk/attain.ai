'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Create user profile with default timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        timezone,
        chat_summaries: {},
      })

    if (profileError) {
      console.error('Failed to create user profile:', profileError)
    }
  }

  redirect('/app')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/app')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
