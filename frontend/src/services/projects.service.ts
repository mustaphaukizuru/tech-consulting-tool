import { api } from '@/lib/api'
import type { PageResponse, ProjectStatus } from '@/types/api'
import type { Project, ProjectInput } from '@/types/project'

export interface ListParams {
  q?: string
  status?: ProjectStatus
  page?: number
  size?: number
  sort?: string
}

export const projectsService = {
  list: async (params: ListParams = {}): Promise<PageResponse<Project>> => {
    const { data } = await api.get<PageResponse<Project>>('/projects', { params })
    return data
  },
  get: async (id: number): Promise<Project> => {
    const { data } = await api.get<Project>(`/projects/${id}`)
    return data
  },
  create: async (input: ProjectInput): Promise<Project> => {
    const { data } = await api.post<Project>('/projects', input)
    return data
  },
  update: async (id: number, input: ProjectInput): Promise<Project> => {
    const { data } = await api.put<Project>(`/projects/${id}`, input)
    return data
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },
}
