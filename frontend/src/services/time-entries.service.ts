import { api } from '@/lib/api'
import type { PageResponse } from '@/types/api'
import type { TimeEntry, TimeEntryInput, TimeEntrySummary } from '@/types/time-entry'

export const timeEntriesService = {
  listMine: async (): Promise<PageResponse<TimeEntry>> => {
    const { data } = await api.get<PageResponse<TimeEntry>>('/time-entries/mine')
    return data
  },
  listByProject: async (projectId: number): Promise<PageResponse<TimeEntry>> => {
    const { data } = await api.get<PageResponse<TimeEntry>>(`/projects/${projectId}/time-entries`)
    return data
  },
  summary: async (projectId: number): Promise<TimeEntrySummary> => {
    const { data } = await api.get<TimeEntrySummary>(`/projects/${projectId}/time-entries/summary`)
    return data
  },
  create: async (input: TimeEntryInput): Promise<TimeEntry> => {
    const { data } = await api.post<TimeEntry>('/time-entries', input)
    return data
  },
  update: async (id: number, input: Omit<TimeEntryInput, 'projectId'>): Promise<TimeEntry> => {
    const { data } = await api.put<TimeEntry>(`/time-entries/${id}`, input)
    return data
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/time-entries/${id}`)
  },
}
