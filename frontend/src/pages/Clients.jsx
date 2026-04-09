import { Users } from 'lucide-react'

export default function Clients() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>Clients</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Manage your consulting clients</p>
      <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
        <Users size={48} style={{ margin: '0 auto 1rem', color: '#6366f1', opacity: 0.5 }} />
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Client management coming soon.</p>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          This module will allow you to track all your clients, their projects and contact details.
        </p>
      </div>
    </div>
  )
}
