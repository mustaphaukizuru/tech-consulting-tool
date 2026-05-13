import type { UserSummary } from '@/types/auth'

const ACCESS = 'access_token'
const REFRESH = 'refresh_token'
const USER = 'user'

export const storage = {
  getAccess: (): string | null => localStorage.getItem(ACCESS),
  getRefresh: (): string | null => localStorage.getItem(REFRESH),
  getUser: (): UserSummary | null => {
    const raw = localStorage.getItem(USER)
    return raw ? (JSON.parse(raw) as UserSummary) : null
  },
  setSession: (access: string, refresh: string, user: UserSummary) => {
    localStorage.setItem(ACCESS, access)
    localStorage.setItem(REFRESH, refresh)
    localStorage.setItem(USER, JSON.stringify(user))
  },
  clear: () => {
    localStorage.removeItem(ACCESS)
    localStorage.removeItem(REFRESH)
    localStorage.removeItem(USER)
  },
}
