import { api } from '@/lib/api'
import type { PageResponse } from '@/types/api'
import type { Task, TaskInput } from '@/types/task'

export const tasksService = {
  listByProject: async (projectId: number): Promise<PageResponse<Task>> => {
    const { data } = await api.get<PageResponse<Task>>(`/projects/${projectId}/tasks`)
    return data
  },
  create: async (projectId: number, input: TaskInput): Promise<Task> => {
    const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, input)
    return data
  },
  update: async (id: number, input: TaskInput): Promise<Task> => {
    const { data } = await api.put<Task>(`/tasks/${id}`, input)
    return data
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },
}
