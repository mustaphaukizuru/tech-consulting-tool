import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { storage } from '@/lib/storage'
import { authEvents } from '@/lib/authEvents'
import { authService } from '@/services/auth.service'
import type { AuthResponse, LoginPayload, RegisterPayload, UserSummary } from '@/types/auth'
import type { Role } from '@/types/api'

interface AuthContextValue {
  user: UserSummary | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(() => storage.getUser())

  const applySession = useCallback((res: AuthResponse) => {
    storage.setSession(res.accessToken, res.refreshToken, res.user)
    setUser(res.user)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload)
    applySession(res)
  }, [applySession])

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authService.register(payload)
    applySession(res)
  }, [applySession])

  const logout = useCallback(() => {
    storage.clear()
    setUser(null)
  }, [])

  useEffect(() => authEvents.onUnauthorized(() => setUser(null)), [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole: (...roles) => !!user && roles.includes(user.role),
  }), [user, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
