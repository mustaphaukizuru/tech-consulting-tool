export interface Client {
  id: number
  companyName: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  notes: string | null
  ownerId: number | null
  ownerName: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientInput {
  companyName: string
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  notes?: string | null
}
