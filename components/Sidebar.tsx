'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Goal } from '@/types'

interface SidebarProps {
  goals: Goal[]
  selectedGoalId: string | null
  onSelectGoal: (id: string) => void
  onCreateGoal: () => void
}

export function Sidebar({ goals, selectedGoalId, onSelectGoal, onCreateGoal }: SidebarProps) {
  const { signOut } = useAuth()
  const canCreateGoal = goals.length < 3

  return (
    <div className="w-64 h-screen bg-muted/30 border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">attain.ai</h1>
      </div>

      {/* Create Goal Button */}
      <div className="p-4">
        <Button
          onClick={onCreateGoal}
          disabled={!canCreateGoal}
          className="w-full"
          variant={canCreateGoal ? 'default' : 'secondary'}
        >
          Create Goal
        </Button>
        {!canCreateGoal && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Maximum 3 goals reached
          </p>
        )}
      </div>

      {/* Goal List */}
      <div className="flex-1 overflow-y-auto">
        {goals.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No goals yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => onSelectGoal(goal.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedGoalId === goal.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium truncate">{goal.title}</div>
                {goal.description && (
                  <div className="text-xs opacity-70 truncate mt-0.5">
                    {goal.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Logout */}
      <div className="p-4 border-t">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
