import { createClient } from '@/lib/supabase/server'
import { getCoachingSystemPrompt } from '@/lib/prompts/coaching'
import OpenAI from 'openai'

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

    // Build messages for OpenAI
    const openaiMessages = [
      {
        role: 'system' as const,
        content: getCoachingSystemPrompt(goal),
      },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ]

    // Call OpenAI with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
      stream: true,
    })

    // Create a custom readable stream
    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              controller.enqueue(encoder.encode(content))
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
