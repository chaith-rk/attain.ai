import type { FunctionTool } from 'openai/resources/responses/responses'

export const updateIntentTool: FunctionTool = {
  type: 'function',
  name: 'update_intent',
  description: 'Propose an intent update for a specific day. Use this when the user says what they want to do today or tomorrow. The update will be confirmed by the user before it is applied.',
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
    additionalProperties: false,
  },
  strict: true,
}

export const tools: FunctionTool[] = [updateIntentTool]
