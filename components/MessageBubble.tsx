'use client'

import { useState } from 'react'
import type { Message } from '@/types'
import { cn } from '@/lib/utils'
import { parseIntentUpdate } from '@/lib/intentUpdates'
import { IntentConfirmCard } from '@/components/IntentConfirmCard'

interface MessageBubbleProps {
  message: Message
  onConfirmIntentUpdate?: (input: { goalId: string; messageId: string; itemId: string }) => Promise<void>
}

export function MessageBubble({ message, onConfirmIntentUpdate }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const { text, payload } = parseIntentUpdate(message.content)
  const [confirmingIds, setConfirmingIds] = useState<string[]>([])

  const handleConfirm = async (itemId: string) => {
    if (!onConfirmIntentUpdate || confirmingIds.includes(itemId)) return
    setConfirmingIds((prev) => [...prev, itemId])
    try {
      await onConfirmIntentUpdate({
        goalId: message.goal_id,
        messageId: message.id,
        itemId,
      })
    } finally {
      setConfirmingIds((prev) => prev.filter((id) => id !== itemId))
    }
  }

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {text && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {text}
          </p>
        )}
        {!isUser && payload?.type === 'intent_update' && payload.items.length > 0 && (
          <div className={cn('mt-2 flex flex-col gap-2', text ? '' : 'mt-0')}>
            {payload.items.map((item) => (
              <div key={item.id}>
                <IntentConfirmCard
                  intentText={item.intent}
                  dateISO={item.date}
                  onConfirm={() => handleConfirm(item.id)}
                  status={item.status}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
