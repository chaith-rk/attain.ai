'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GoalTable } from '@/components/GoalTable'
import { ChatView } from '@/components/ChatView'
import { DeleteGoalDialog } from '@/components/DeleteGoalDialog'
import type { Goal, GoalDay, Message } from '@/types'

interface GoalViewProps {
  goal: Goal
  goalDays: GoalDay[]
  goalDaysLoading: boolean
  messages: Message[]
  messagesLoading: boolean
  onUpdateGoalDay: (goalDayId: string, field: 'intent' | 'action', value: string) => Promise<void>
  onSendMessage: (content: string) => Promise<void>
  onConfirmIntentUpdate: (input: { goalId: string; messageId: string; itemId: string }) => Promise<void>
  onDeleteGoal: () => Promise<void>
  isSendingMessage: boolean
}

export function GoalView({
  goal,
  goalDays,
  goalDaysLoading,
  messages,
  messagesLoading,
  onUpdateGoalDay,
  onSendMessage,
  onConfirmIntentUpdate,
  onDeleteGoal,
  isSendingMessage,
}: GoalViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Left Section: Table */}
      <div className="flex-1 flex flex-col border-r overflow-hidden">
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
      </div>

      {/* Right Section: Chat */}
      <div className="w-96 flex flex-col overflow-hidden">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          </div>
        ) : (
          <ChatView
            goal={goal}
            messages={messages}
            onSendMessage={onSendMessage}
            onConfirmIntentUpdate={onConfirmIntentUpdate}
            isLoading={isSendingMessage}
          />
        )}
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
