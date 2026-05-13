import axios, { AxiosError } from 'axios'
import { authEvents } from './authEvents'
import { storage } from './storage'
import type { ProblemDetail } from '@/types/api'

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = storage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  (err: AxiosError<ProblemDetail>) => {
    if (err.response?.status === 401) {
      storage.clear()
      authEvents.emitUnauthorized()
    }
    return Promise.reject(err)
  },
)

export function problemMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const pd = err.response?.data as ProblemDetail | undefined
    return pd?.detail ?? pd?.title ?? err.message ?? fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}
