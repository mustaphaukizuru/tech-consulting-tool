import type { Role } from './api'

export interface UserSummary {
  id: number
  email: string
  fullName: string
  role: Role
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserSummary
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}
