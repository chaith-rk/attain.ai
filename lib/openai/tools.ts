import type { ChatCompletionTool } from 'openai/resources/chat/completions'

export const updateIntentTool: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'update_intent',
    description: 'Update the intent (plan) for a specific day. Use this when the user says what they want to do today or tomorrow.',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          enum: ['today', 'tomorrow'],
          description: 'Which day to update - either "today" or "tomorrow"',
        },
        intent: {
          type: 'string',
          description: 'What the user plans to do on this day. Be concise (under 200 chars). Extract the core action from what they said.',
        },
      },
      required: ['date', 'intent'],
    },
  },
}

export const tools: ChatCompletionTool[] = [updateIntentTool]
