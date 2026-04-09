import { useState, useEffect } from 'react'
import { projectAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { FolderKanban, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:     { cls: 'badge-pending',   label: 'Pending' },
    IN_PROGRESS: { cls: 'badge-progress',  label: 'In Progress' },
    COMPLETED:   { cls: 'badge-completed', label: 'Completed' },
    CANCELLED:   { cls: 'badge-cancelled', label: 'Cancelled' },
  }
  const s = map[status] || map.PENDING
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    projectAPI.getAll()
      .then(r => setProjects(r.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    total:      projects.length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    completed:  projects.filter(p => p.status === 'COMPLETED').length,
    pending:    projects.filter(p => p.status === 'PENDING').length,
  }

  const stats = [
    { label: 'Total Projects', value: counts.total,      icon: <FolderKanban size={22} />, color: '#6366f1' },
    { label: 'In Progress',    value: counts.inProgress, icon: <TrendingUp size={22} />,   color: '#818cf8' },
    { label: 'Completed',      value: counts.completed,  icon: <CheckCircle size={22} />,  color: '#22c55e' },
    { label: 'Pending',        value: counts.pending,    icon: <Clock size={22} />,        color: '#fbbf24' },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9' }}>
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: s.color + '20', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: s.color, flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem' }}>
          Recent Projects
        </h2>
        {loading ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading…</p>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No projects yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projects.slice(0, 5).map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.875rem 1rem', background: '#0f172a',
                borderRadius: '8px', border: '1px solid #1e3a5f20',
              }}>
                <div>
                  <div style={{ fontWeight: 500, color: '#f1f5f9', fontSize: '0.95rem' }}>{p.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    {p.description?.slice(0, 60)}…
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
