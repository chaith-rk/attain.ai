import { createClient } from '@/lib/supabase/server'
import { updateIntentUpdateStatus } from '@/lib/intentUpdates'

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

    const { data: goalDay, error: fetchError } = await supabase
      .from('goal_days')
      .select('*')
      .eq('goal_id', goalId)
      .eq('date', item.date)
      .single()

    if (fetchError || !goalDay) {
      const { error: createError } = await supabase
        .from('goal_days')
        .insert({
          goal_id: goalId,
          date: item.date,
          intent: item.intent,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating goal_day:', createError)
        return new Response('Failed to apply update', { status: 500 })
      }
    } else {
      const { error: updateError } = await supabase
        .from('goal_days')
        .update({ intent: item.intent })
        .eq('id', goalDay.id)

      if (updateError) {
        console.error('Error updating intent:', updateError)
        return new Response('Failed to apply update', { status: 500 })
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
