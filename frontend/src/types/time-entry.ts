export interface TimeEntry {
  id: number
  projectId: number
  projectTitle: string
  userId: number
  userName: string
  minutes: number
  workDate: string
  description: string | null
  billable: boolean
  rateCents: number | null
  createdAt: string
  updatedAt: string
}

export interface TimeEntryInput {
  projectId: number
  minutes: number
  workDate: string
  description?: string | null
  billable?: boolean
  rateCents?: number | null
}

export interface TimeEntrySummary {
  totalMinutes: number
  billableMinutes: number
  totalRevenueCents: number
}
