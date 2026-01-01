'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GoalTable } from '@/components/GoalTable'
import { DeleteGoalDialog } from '@/components/DeleteGoalDialog'
import type { Goal, GoalDay } from '@/types'

interface GoalViewProps {
  goal: Goal
  goalDays: GoalDay[]
  goalDaysLoading: boolean
  onUpdateGoalDay: (goalDayId: string, field: 'intent' | 'action', value: string) => Promise<void>
  onDeleteGoal: () => Promise<void>
}

export function GoalView({
  goal,
  goalDays,
  goalDaysLoading,
  onUpdateGoalDay,
  onDeleteGoal,
}: GoalViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{goal.title}</h1>
          {goal.description && (
            <p className="text-muted-foreground mt-1">{goal.description}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          className="text-destructive hover:text-destructive"
        >
          Delete Goal
        </Button>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto p-4">
        <GoalTable
          goalDays={goalDays}
          loading={goalDaysLoading}
          onUpdateGoalDay={onUpdateGoalDay}
        />
      </div>

      {/* Chat section will be added in Phase 3 */}
      <div className="border-t p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground text-center">
          Chat interface coming in Phase 3
        </p>
      </div>

      <DeleteGoalDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        goalTitle={goal.title}
        onConfirm={onDeleteGoal}
      />
    </div>
  )
}
