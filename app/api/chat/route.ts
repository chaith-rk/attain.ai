import { createClient } from '@/lib/supabase/server'
import { getCoachingSystemPrompt } from '@/lib/prompts/coaching'
import { tools } from '@/lib/openai/tools'
import { withIntentUpdate } from '@/lib/intentUpdates'
import OpenAI from 'openai'
import type { ResponseInputItem, ResponseStreamEvent } from 'openai/resources/responses/responses'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

function isDateQuestion(message: string): boolean {
  const normalized = message.trim().toLowerCase()
  return (
    normalized === 'what is today\'s date' ||
    normalized === "what's today's date" ||
    normalized === 'what is the date' ||
    normalized === "what's the date" ||
    normalized === 'what day is it' ||
    normalized === "what's today" ||
    normalized.includes('today\'s date') ||
    normalized.includes("today's date") ||
    normalized.includes('current date')
  )
}

function resolveTimeZone(candidate?: string): string {
  if (!candidate) return 'UTC'
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date())
    return candidate
  } catch {
    return 'UTC'
  }
}

function formatDateISO(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatDateHuman(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export async function POST(req: Request) {
  try {
    const { goalId, message, timezone } = await req.json()

    if (!goalId || !message) {
      return new Response('Missing goalId or message', { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('timezone')
      .eq('id', user.id)
      .single()

    const timeZone = resolveTimeZone(timezone || profile?.timezone)
    const now = new Date()
    const todayISO = formatDateISO(now, timeZone)
    const tomorrowDate = new Date(now)
    tomorrowDate.setDate(now.getDate() + 1)
    const tomorrowISO = formatDateISO(tomorrowDate, timeZone)
    const todayHuman = formatDateHuman(now, timeZone)
  const tomorrowHuman = formatDateHuman(tomorrowDate, timeZone)

    // Fetch goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (goalError || !goal) {
      return new Response('Goal not found', { status: 404 })
    }

    // Save user message
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        goal_id: goalId,
        role: 'user',
        content: message,
      })

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError)
      return new Response('Failed to save message', { status: 500 })
    }

    if (isDateQuestion(message)) {
      const assistantContent = `Today is ${todayHuman}.`
      const { error: assistantMessageError } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          goal_id: goalId,
          role: 'assistant',
          content: assistantContent,
        })

      if (assistantMessageError) {
        console.error('Error saving assistant message:', assistantMessageError)
      }

      return new Response(assistantContent, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    // Fetch goal days for context
    const { data: goalDays, error: goalDaysError } = await supabase
      .from('goal_days')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: true })
      .limit(7)

    if (goalDaysError) {
      console.error('Error fetching goal days:', goalDaysError)
      return new Response('Failed to fetch goal days', { status: 500 })
    }

    // Fetch conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return new Response('Failed to fetch messages', { status: 500 })
    }

    // Build input for Responses API (conversation history)
    const inputItems: ResponseInputItem[] = messages.map((msg) => ({
      type: 'message' as const,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // Call OpenAI Responses API with streaming
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      instructions: getCoachingSystemPrompt(goal, goalDays || [], {
        todayISO,
        tomorrowISO,
        todayHuman,
        tomorrowHuman,
      }),
      input: inputItems,
      tools,
      temperature: 0.7,
      stream: true,
    })

    // Create a custom readable stream
    const encoder = new TextEncoder()
    let fullResponse = ''
    const toolCalls: Array<{
      id: string
      name: string
      arguments: string
    }> = []

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of response as AsyncIterable<ResponseStreamEvent>) {
            // Handle text content delta
            if (event.type === 'response.output_text.delta') {
              const delta = event.delta
              if (delta) {
                fullResponse += delta
                controller.enqueue(encoder.encode(delta))
              }
            }

            // Handle function call completion
            if (event.type === 'response.output_item.done') {
              const item = event.item
              if (item.type === 'function_call') {
                toolCalls.push({
                  id: item.call_id,
                  name: item.name,
                  arguments: item.arguments,
                })
              }
            }
          }

          // Build pending intent updates (require user confirmation)
          if (toolCalls.length > 0) {
            const today = todayISO
            const tomorrow = tomorrowISO
            const pendingItems: Array<{
              id: string
              date: string
              label: string
              intent: string
              status: 'pending'
            }> = []

            for (const toolCall of toolCalls) {
              if (toolCall.name !== 'update_intent') continue
              try {
                const args = JSON.parse(toolCall.arguments)
                const { date, intent } = args
                const targetDate = date === 'today' ? today : tomorrow
                const label = targetDate === today ? 'Today' : targetDate === tomorrow ? 'Tomorrow' : targetDate

                pendingItems.push({
                  id: crypto.randomUUID(),
                  date: targetDate,
                  label,
                  intent,
                  status: 'pending',
                })
              } catch (error) {
                console.error('Error processing tool call:', error)
              }
            }

            if (pendingItems.length > 0) {
              const assistantText = fullResponse.trim() || 'Please confirm the update below.'

              if (!fullResponse.trim()) {
                controller.enqueue(encoder.encode(assistantText))
              }

              const payload = { type: 'intent_update', items: pendingItems }
              const tag = withIntentUpdate('', payload)
              const separator = assistantText ? '\n\n' : ''

              controller.enqueue(encoder.encode(`${separator}${tag}`))
              fullResponse = withIntentUpdate(assistantText, payload)
            }
          }

          // Save assistant message to database after streaming completes
          const { error: assistantMessageError } = await supabase
            .from('messages')
            .insert({
              user_id: user.id,
              goal_id: goalId,
              role: 'assistant',
              content: fullResponse,
            })

          if (assistantMessageError) {
            console.error('Error saving assistant message:', assistantMessageError)
          }

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
