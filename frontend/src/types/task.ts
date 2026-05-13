import type { TaskStatus } from './api'

export interface Task {
  id: number
  projectId: number
  title: string
  description: string | null
  status: TaskStatus
  assigneeId: number | null
  assigneeName: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description?: string | null
  status?: TaskStatus
  assigneeId?: number | null
  dueDate?: string | null
}
