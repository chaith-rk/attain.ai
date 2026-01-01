'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import type { GoalDay } from '@/types'

interface GoalTableProps {
  goalDays: GoalDay[]
  loading: boolean
  onUpdateGoalDay: (goalDayId: string, field: 'intent' | 'action', value: string) => Promise<void>
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dateToCheck = new Date(dateString + 'T00:00:00')
  dateToCheck.setHours(0, 0, 0, 0)

  if (dateToCheck.getTime() === today.getTime()) {
    return 'Today'
  }
  if (dateToCheck.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function isToday(dateString: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateString + 'T00:00:00')
  date.setHours(0, 0, 0, 0)
  return date.getTime() === today.getTime()
}

interface EditableCellProps {
  value: string | null
  onSave: (value: string) => Promise<void>
  placeholder: string
}

function EditableCell({ value, onSave, placeholder }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (editValue !== (value || '')) {
      setIsSaving(true)
      try {
        await onSave(editValue)
      } catch (error) {
        console.error('Failed to save:', error)
        setEditValue(value || '')
      } finally {
        setIsSaving(false)
      }
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value || '')
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className="h-8 text-sm"
        autoFocus
        maxLength={200}
      />
    )
  }

  return (
    <div
      onClick={() => {
        setEditValue(value || '')
        setIsEditing(true)
      }}
      className="min-h-[32px] px-2 py-1 rounded cursor-pointer hover:bg-muted transition-colors flex items-center"
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
    </div>
  )
}

export function GoalTable({ goalDays, loading, onUpdateGoalDay }: GoalTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (goalDays.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No days scheduled yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Intent</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goalDays.map((day) => (
            <TableRow
              key={day.id}
              className={isToday(day.date) ? 'bg-primary/5' : undefined}
            >
              <TableCell className="font-medium">
                {formatDate(day.date)}
                {isToday(day.date) && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Today
                  </span>
                )}
              </TableCell>
              <TableCell>
                <EditableCell
                  value={day.intent}
                  onSave={(value) => onUpdateGoalDay(day.id, 'intent', value)}
                  placeholder="Click to add intent..."
                />
              </TableCell>
              <TableCell>
                <EditableCell
                  value={day.action}
                  onSave={(value) => onUpdateGoalDay(day.id, 'action', value)}
                  placeholder="Click to add action..."
                />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {day.notes || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
