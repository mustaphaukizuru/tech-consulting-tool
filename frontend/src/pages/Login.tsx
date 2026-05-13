import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Briefcase, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { problemMessage } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

interface LocationState {
  from?: { pathname?: string }
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [apiError, setApiError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async values => {
    setApiError('')
    try {
      await login(values)
      const state = location.state as LocationState | null
      navigate(state?.from?.pathname ?? '/dashboard', { replace: true })
    } catch (e) {
      setApiError(problemMessage(e, 'Invalid credentials'))
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4
                    bg-[radial-gradient(ellipse_at_20%_50%,rgba(99,102,241,0.08),transparent_60%)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-500/15 rounded-2xl mb-4">
            <Briefcase className="text-indigo-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your consulting dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4">
          {apiError && (
            <div role="alert" className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
              {apiError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input pl-9"
                placeholder="you@example.com"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input pl-9"
                placeholder="••••••••"
                {...register('password')}
              />
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? <><Spinner /> Signing in...</> : 'Sign In'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
