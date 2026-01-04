import { createClient } from '@/lib/supabase/server'
import { updateIntentUpdateStatus } from '@/lib/intentUpdates'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { goalId, messageId, itemId } = await req.json()

    if (!goalId || !messageId || !itemId) {
      return new Response('Missing goalId, messageId, or itemId', { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .single()

    if (messageError || !message) {
      return new Response('Message not found', { status: 404 })
    }

    const { updatedContent, item } = updateIntentUpdateStatus(message.content, itemId, 'confirmed')
    if (!item) {
      return new Response('Pending update not found', { status: 400 })
    }

    let { data: goalDay, error: fetchError } = await supabase
      .from('goal_days')
      .select('*')
      .eq('goal_id', goalId)
      .eq('date', item.date)
      .single()

    if (fetchError || !goalDay) {
      const { data: createdGoalDay, error: createError } = await supabase
        .from('goal_days')
        .insert({
          goal_id: goalId,
          date: item.date,
          [item.field]: item.value,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating goal_day:', createError)
        return new Response('Failed to apply update', { status: 500 })
      }
      goalDay = createdGoalDay
    } else {
      const { error: updateError } = await supabase
        .from('goal_days')
        .update({ [item.field]: item.value })
        .eq('id', goalDay.id)

      if (updateError) {
        console.error('Error updating goal_day:', updateError)
        return new Response('Failed to apply update', { status: 500 })
      }

    }

    // If action was applied, generate notes using LLM
    if (item.field === 'action') {
      const { data: refreshedGoalDay, error: refreshedError } = await supabase
        .from('goal_days')
        .select('*')
        .eq('goal_id', goalId)
        .eq('date', item.date)
        .single()

      if (refreshedError || !refreshedGoalDay) {
        console.error('Error refetching goal_day for notes:', refreshedError)
      } else {
        try {
          const intentText = refreshedGoalDay.intent || ''
          const actionText = refreshedGoalDay.action || item.value
          const instructions = [
            'You are a supportive coach. Write a brief note (<=200 chars) comparing intent vs action.',
            'Tone: supportive, no judgment. Acknowledge partial wins.',
            'If no intent exists, just reflect positively on the action.',
          ].join('\n')

          const response = await openai.responses.create({
            model: 'gpt-4o-mini',
            instructions,
            input: [
              {
                role: 'user',
                content: `Intent: ${intentText || '(none)'}\nAction: ${actionText}`,
              },
            ],
          })

          const raw = response.output_text
          const text =
            Array.isArray(raw) ? raw.join(' ').trim() : (raw ? raw.trim() : '')

          if (text) {
            const { error: notesError } = await supabase
              .from('goal_days')
              .update({ notes: text })
              .eq('id', refreshedGoalDay.id)

            if (notesError) {
              console.error('Error updating notes:', notesError)
            }
          }
        } catch (error) {
          console.error('Error generating notes:', error)
        }
      }
    }

    const { error: updateMessageError } = await supabase
      .from('messages')
      .update({ content: updatedContent })
      .eq('id', messageId)

    if (updateMessageError) {
      console.error('Error updating message:', updateMessageError)
      return new Response('Failed to update message', { status: 500 })
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Confirm intent error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
