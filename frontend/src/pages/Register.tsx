import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Briefcase, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { problemMessage } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'

// NOTE: there is intentionally NO role field. Backend ignores it; new users
// are always created as CLIENT. Admins must be promoted via DB or an admin API.
const schema = z.object({
  fullName: z.string().min(2, 'Full name is too short').max(120),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
})

type FormValues = z.infer<typeof schema>

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async values => {
    setApiError('')
    try {
      await registerUser(values)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setApiError(problemMessage(e, 'Registration failed'))
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4
                    bg-[radial-gradient(ellipse_at_80%_50%,rgba(99,102,241,0.08),transparent_60%)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-500/15 rounded-2xl mb-4">
            <Briefcase className="text-indigo-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">Join the consulting platform</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4">
          {apiError && (
            <div role="alert" className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
              {apiError}
            </div>
          )}

          <Field id="fullName" label="Full Name" icon={<User size={16} />}
                 error={errors.fullName?.message} register={register('fullName')}
                 autoComplete="name" placeholder="Jane Doe" />

          <Field id="email" label="Email" type="email" icon={<Mail size={16} />}
                 error={errors.email?.message} register={register('email')}
                 autoComplete="email" placeholder="you@example.com" />

          <Field id="password" label="Password" type="password" icon={<Lock size={16} />}
                 error={errors.password?.message} register={register('password')}
                 autoComplete="new-password" placeholder="At least 8 characters" />

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? <><Spinner /> Creating...</> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({
  id, label, type = 'text', icon, error, register, placeholder, autoComplete,
}: {
  id: string
  label: string
  type?: string
  icon: React.ReactNode
  error?: string
  register: ReturnType<ReturnType<typeof useForm>['register']>
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="input pl-9"
          {...register}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
