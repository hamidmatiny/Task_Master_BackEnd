import { AnalyticsSummary, Task, TaskCreate } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'API request failed')
  }

  return response.json()
}

export function fetchTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks/')
}

export function createTask(payload: TaskCreate): Promise<Task> {
  return request<Task>('/tasks/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(id: number, payload: Partial<TaskCreate>): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(id: number): Promise<void> {
  return request<void>(`/tasks/${id}`, {
    method: 'DELETE',
  })
}

export function fetchAnalytics(): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>('/analytics/summary')
}

export function loadSampleTasks(): Promise<{ imported_tasks: number; message: string }> {
  return request('/etl/load-sample', {
    method: 'POST',
  })
}
