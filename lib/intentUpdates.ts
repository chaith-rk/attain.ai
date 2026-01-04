export const INTENT_UPDATE_TAG = 'INTENT_UPDATE'

export type IntentUpdateStatus = 'pending' | 'confirmed'

export interface IntentUpdateItem {
  id: string
  date: string
  label: string
  intent: string
  status: IntentUpdateStatus
}

export interface IntentUpdatePayload {
  type: 'intent_update'
  items: IntentUpdateItem[]
}

export function parseIntentUpdate(content: string): {
  text: string
  payload: IntentUpdatePayload | null
} {
  const match = content.match(new RegExp(`<${INTENT_UPDATE_TAG}>([\\s\\S]*?)<\\/${INTENT_UPDATE_TAG}>`))
  if (!match) {
    return { text: content, payload: null }
  }

  const json = match[1].trim()
  let payload: IntentUpdatePayload | null = null
  try {
    payload = JSON.parse(json) as IntentUpdatePayload
  } catch {
    payload = null
  }

  const text = content.replace(match[0], '').trim()
  return { text, payload }
}

export function withIntentUpdate(content: string, payload: IntentUpdatePayload): string {
  const base = content.trim()
  const serialized = JSON.stringify(payload)
  if (!base) {
    return `<${INTENT_UPDATE_TAG}>${serialized}</${INTENT_UPDATE_TAG}>`
  }
  return `${base}\n\n<${INTENT_UPDATE_TAG}>${serialized}</${INTENT_UPDATE_TAG}>`
}

export function updateIntentUpdateStatus(
  content: string,
  itemId: string,
  status: IntentUpdateStatus
): { updatedContent: string; item: IntentUpdateItem | null } {
  const { text, payload } = parseIntentUpdate(content)
  if (!payload || payload.type !== 'intent_update') {
    return { updatedContent: content, item: null }
  }

  let updatedItem: IntentUpdateItem | null = null
  const items = payload.items.map((item) => {
    if (item.id !== itemId) return item
    updatedItem = { ...item, status }
    return updatedItem
  })

  if (!updatedItem) {
    return { updatedContent: content, item: null }
  }

  const updatedPayload: IntentUpdatePayload = { ...payload, items }
  return { updatedContent: withIntentUpdate(text, updatedPayload), item: updatedItem }
}
