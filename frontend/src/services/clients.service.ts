import { api } from '@/lib/api'
import type { PageResponse } from '@/types/api'
import type { Client, ClientInput } from '@/types/client'

export interface ListParams {
  q?: string
  page?: number
  size?: number
  sort?: string
}

export const clientsService = {
  list: async (params: ListParams = {}): Promise<PageResponse<Client>> => {
    const { data } = await api.get<PageResponse<Client>>('/clients', { params })
    return data
  },
  get: async (id: number): Promise<Client> => {
    const { data } = await api.get<Client>(`/clients/${id}`)
    return data
  },
  create: async (input: ClientInput): Promise<Client> => {
    const { data } = await api.post<Client>('/clients', input)
    return data
  },
  update: async (id: number, input: ClientInput): Promise<Client> => {
    const { data } = await api.put<Client>(`/clients/${id}`, input)
    return data
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}`)
  },
}
