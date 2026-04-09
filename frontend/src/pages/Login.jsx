import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Briefcase, Mail, Lock, Loader } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0f172a',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, #6366f115 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 1rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', background: '#6366f120',
            borderRadius: '14px', marginBottom: '1rem',
          }}>
            <Briefcase size={28} color="#6366f1" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9' }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Sign in to your consulting dashboard
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                background: '#ef444415', border: '1px solid #ef444440',
                borderRadius: '8px', padding: '0.75rem', color: '#ef4444', fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  className="input"
                  style={{ paddingLeft: '2.5rem' }}
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  className="input"
                  style={{ paddingLeft: '2.5rem' }}
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? <><Loader size={16} className="spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
