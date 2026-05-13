import type { ProjectStatus } from './api'

export interface Project {
  id: number
  title: string
  description: string | null
  status: ProjectStatus
  clientId: number | null
  clientName: string | null
  consultantId: number | null
  consultantName: string | null
  startDate: string | null
  endDate: string | null
  budgetCents: number | null
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  title: string
  description?: string | null
  status?: ProjectStatus
  clientId?: number | null
  consultantId?: number | null
  startDate?: string | null
  endDate?: string | null
  budgetCents?: number | null
}
