import { createClient } from '@/lib/supabase/server'
import { getCoachingSystemPrompt } from '@/lib/prompts/coaching'
import { tools } from '@/lib/openai/tools'
import OpenAI from 'openai'
import type { ResponseInputItem, ResponseStreamEvent } from 'openai/resources/responses/responses'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { goalId, message } = await req.json()

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
      instructions: getCoachingSystemPrompt(goal, goalDays || []),
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

          // Execute tool calls if any
          if (toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              if (toolCall.name === 'update_intent') {
                try {
                  const args = JSON.parse(toolCall.arguments)
                  const { date, intent } = args

                  // Resolve date to actual date string
                  const today = new Date().toISOString().split('T')[0]
                  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
                  const targetDate = date === 'today' ? today : tomorrow

                  // Find or create goal_day
                  const { data: goalDay, error: fetchError } = await supabase
                    .from('goal_days')
                    .select('*')
                    .eq('goal_id', goalId)
                    .eq('date', targetDate)
                    .single()

                  if (fetchError || !goalDay) {
                    // Create new goal_day if it doesn't exist
                    const { error: createError } = await supabase
                      .from('goal_days')
                      .insert({
                        goal_id: goalId,
                        date: targetDate,
                        intent,
                      })
                      .select()
                      .single()

                    if (createError) {
                      console.error('Error creating goal_day:', createError)
                    }
                  } else {
                    // Update existing goal_day
                    const { error: updateError } = await supabase
                      .from('goal_days')
                      .update({ intent })
                      .eq('id', goalDay.id)

                    if (updateError) {
                      console.error('Error updating intent:', updateError)
                    }
                  }
                } catch (error) {
                  console.error('Error processing tool call:', error)
                }
              }
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
