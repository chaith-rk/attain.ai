'use client'

import { useState } from 'react'
import type { Message } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { parseIntentUpdate } from '@/lib/intentUpdates'

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
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.intent}</span>
                </div>
                {item.status === 'confirmed' ? (
                  <span className="text-emerald-600">Confirmed</span>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    disabled={!onConfirmIntentUpdate || confirmingIds.includes(item.id)}
                    onClick={() => handleConfirm(item.id)}
                  >
                    {confirmingIds.includes(item.id) ? 'Updating...' : 'Confirm'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
