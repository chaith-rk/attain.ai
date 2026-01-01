'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { GoalView } from '@/components/GoalView'
import { CreateGoalDialog } from '@/components/CreateGoalDialog'
import { useAppStore } from '@/stores/useAppStore'
import {
  fetchGoals,
  fetchGoalDays,
  fetchMessages,
  createGoalWithDays,
  deleteGoal,
  updateGoalDay,
} from '@/lib/supabase/queries'
import type { Message } from '@/types'

export default function AppPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const {
    goals,
    goalsLoading,
    setGoals,
    addGoal,
    removeGoal,
    setGoalsLoading,
    selectedGoalId,
    setSelectedGoalId,
    goalDays,
    goalDaysLoading,
    setGoalDays,
    updateGoalDayInStore,
    setGoalDaysLoading,
    messages,
    messagesLoading,
    setMessages,
    addMessage,
    setMessagesLoading,
  } = useAppStore()

  const selectedGoal = goals.find((g) => g.id === selectedGoalId) || null

  // Load goals on mount
  useEffect(() => {
    async function loadGoals() {
      try {
        const data = await fetchGoals()
        setGoals(data)
      } catch (error) {
        console.error('Failed to load goals:', error)
      } finally {
        setGoalsLoading(false)
      }
    }
    loadGoals()
  }, [setGoals, setGoalsLoading])

  // Load goal days when selected goal changes
  useEffect(() => {
    if (!selectedGoalId) {
      setGoalDays([])
      return
    }

    async function loadGoalDays() {
      setGoalDaysLoading(true)
      try {
        const data = await fetchGoalDays(selectedGoalId!)
        setGoalDays(data)
      } catch (error) {
        console.error('Failed to load goal days:', error)
      } finally {
        setGoalDaysLoading(false)
      }
    }
    loadGoalDays()
  }, [selectedGoalId, setGoalDays, setGoalDaysLoading])

  // Load messages when selected goal changes
  useEffect(() => {
    if (!selectedGoalId) {
      setMessages([])
      return
    }

    async function loadMessages() {
      setMessagesLoading(true)
      try {
        const data = await fetchMessages(selectedGoalId!)
        setMessages(data)
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        setMessagesLoading(false)
      }
    }
    loadMessages()
  }, [selectedGoalId, setMessages, setMessagesLoading])

  const handleCreateGoal = useCallback(
    async (data: { title: string; description: string }) => {
      const { goal, goalDays: newGoalDays } = await createGoalWithDays(
        data.title,
        data.description || null
      )
      addGoal(goal)
      setSelectedGoalId(goal.id)
      setGoalDays(newGoalDays)
    },
    [addGoal, setSelectedGoalId, setGoalDays]
  )

  const handleDeleteGoal = useCallback(async () => {
    if (!selectedGoalId) return
    await deleteGoal(selectedGoalId)
    removeGoal(selectedGoalId)
  }, [selectedGoalId, removeGoal])

  const handleUpdateGoalDay = useCallback(
    async (goalDayId: string, field: 'intent' | 'action', value: string) => {
      const updated = await updateGoalDay(goalDayId, { [field]: value || null })
      updateGoalDayInStore(updated)
    },
    [updateGoalDayInStore]
  )

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedGoalId || isSendingMessage) return

      setIsSendingMessage(true)

      try {
        // Add user message to UI immediately
        const userMessage: Partial<Message> = {
          id: crypto.randomUUID(),
          goal_id: selectedGoalId,
          role: 'user',
          content,
          created_at: new Date().toISOString(),
        }
        addMessage(userMessage as Message)

        // Call API with streaming
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goalId: selectedGoalId, message: content }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        // Read the streaming response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            assistantContent += chunk

            // Update UI with streaming content (create temporary message)
            const tempAssistantMessage: Partial<Message> = {
              id: 'temp-assistant',
              goal_id: selectedGoalId,
              role: 'assistant',
              content: assistantContent,
              created_at: new Date().toISOString(),
            }

            // Replace temp message if it exists, otherwise add it
            const messagesWithoutTemp = messages.filter(m => m.id !== 'temp-assistant')
            setMessages([...messagesWithoutTemp, userMessage as Message, tempAssistantMessage as Message])
          }
        }

        // Reload messages to get the saved assistant message with proper ID
        const updatedMessages = await fetchMessages(selectedGoalId)
        setMessages(updatedMessages)
      } catch (error) {
        console.error('Failed to send message:', error)
      } finally {
        setIsSendingMessage(false)
      }
    },
    [selectedGoalId, isSendingMessage, addMessage, messages, setMessages]
  )

  const handleSelectGoal = useCallback(
    (id: string) => {
      setSelectedGoalId(id)
    },
    [setSelectedGoalId]
  )

  const handleOpenCreateDialog = useCallback(() => {
    setCreateDialogOpen(true)
  }, [])

  return (
    <>
      <Sidebar
        goals={goals}
        goalsLoading={goalsLoading}
        selectedGoalId={selectedGoalId}
        onSelectGoal={handleSelectGoal}
        onCreateGoal={handleOpenCreateDialog}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex bg-background overflow-hidden">
        {selectedGoal ? (
          <GoalView
            goal={selectedGoal}
            goalDays={goalDays}
            goalDaysLoading={goalDaysLoading}
            messages={messages}
            messagesLoading={messagesLoading}
            onUpdateGoalDay={handleUpdateGoalDay}
            onSendMessage={handleSendMessage}
            onDeleteGoal={handleDeleteGoal}
            isSendingMessage={isSendingMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md p-8">
              <h2 className="text-2xl font-bold mb-4">Welcome to attain.ai</h2>
              <p className="text-muted-foreground mb-6">
                Set your goals and track your progress through conversation.
              </p>
              {!goalsLoading && goals.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Click &quot;Create Goal&quot; in the sidebar to get started.
                </p>
              )}
              {!goalsLoading && goals.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Select a goal from the sidebar to view it.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateGoal}
      />
    </>
  )
}
