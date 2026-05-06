export interface Task {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: string
  due_date?: string
  estimated_hours: number
  created_at: string
  updated_at: string
}

export interface AnalyticsSummary {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  average_estimated_hours: number
}

export interface TaskCreate {
  title: string
  description?: string
  completed: boolean
  priority: string
  due_date?: string
  estimated_hours: number
}
