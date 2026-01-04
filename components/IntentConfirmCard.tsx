'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

function formatIntentDate(dateISO: string): string {
  const date = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateISO
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

interface IntentConfirmCardProps {
  intentText: string
  dateISO: string
  onConfirm: () => void
  status?: 'pending' | 'confirmed'
}

export function IntentConfirmCard({
  intentText,
  dateISO,
  onConfirm,
  status = 'pending',
}: IntentConfirmCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-1">
        <div className="text-xs text-muted-foreground">
          <span className="mr-2">Intent:</span>
          <span className="text-sm font-medium text-foreground">{intentText}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="mr-2">Date:</span>
          <span className="text-sm font-medium text-foreground">{formatIntentDate(dateISO)}</span>
        </div>
      </div>
      {status === 'confirmed' ? (
        <div
          className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600"
          aria-live="polite"
        >
          <Check className="h-3.5 w-3.5" />
          Confirmed
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          className="h-9 rounded-full px-4 font-medium shadow-sm"
          onClick={onConfirm}
        >
          Confirm
        </Button>
      )}
    </div>
  )
}
