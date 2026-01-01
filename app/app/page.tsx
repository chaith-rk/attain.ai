'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { useAppStore } from '@/stores/useAppStore'
import { Goal } from '@/types'

export default function AppPage() {
  // For Phase 1, we have no goals yet - they'll be added in Phase 2
  const [goals] = useState<Goal[]>([])
  const { selectedGoalId, setSelectedGoalId } = useAppStore()

  const handleCreateGoal = () => {
    // Will be implemented in Phase 2
    console.log('Create goal clicked')
  }

  const handleSelectGoal = (id: string) => {
    setSelectedGoalId(id)
  }

  return (
    <>
      <Sidebar
        goals={goals}
        selectedGoalId={selectedGoalId}
        onSelectGoal={handleSelectGoal}
        onCreateGoal={handleCreateGoal}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center bg-background">
        {selectedGoalId ? (
          <div className="text-center">
            <p className="text-muted-foreground">Goal view coming in Phase 2</p>
          </div>
        ) : (
          <div className="text-center max-w-md p-8">
            <h2 className="text-2xl font-bold mb-4">Welcome to attain.ai</h2>
            <p className="text-muted-foreground mb-6">
              Set your goals and track your progress through conversation.
            </p>
            {goals.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Click &quot;Create Goal&quot; in the sidebar to get started.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
