import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Briefcase, Mail, Lock, User, Loader } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'CLIENT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      login(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (label, name, type, placeholder, icon) => (
    <div>
      <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>{icon}</span>
        <input
          className="input"
          style={{ paddingLeft: '2.5rem' }}
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => setForm({ ...form, [name]: e.target.value })}
          required
        />
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0f172a',
      backgroundImage: 'radial-gradient(ellipse at 80% 50%, #6366f115 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', background: '#6366f120',
            borderRadius: '14px', marginBottom: '1rem',
          }}>
            <Briefcase size={28} color="#6366f1" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9' }}>Create Account</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>Join the consulting platform</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ background: '#ef444415', border: '1px solid #ef444440', borderRadius: '8px', padding: '0.75rem', color: '#ef4444', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {field('Full Name', 'fullName', 'text', 'Mustapha Ukizuru', <User size={16} />)}
            {field('Email', 'email', 'email', 'you@example.com', <Mail size={16} />)}
            {field('Password', 'password', 'password', '••••••••', <Lock size={16} />)}

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Role</label>
              <select
                className="input"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <option value="CLIENT">Client</option>
                <option value="CONSULTANT">Consultant</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}
              style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? <><Loader size={16} /> Creating...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
