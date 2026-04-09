import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LayoutDashboard, FolderKanban, Users, LogOut, Briefcase } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/projects',  label: 'Projects',  icon: <FolderKanban size={18} /> },
    { to: '/clients',   label: 'Clients',   icon: <Users size={18} /> },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      background: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <Briefcase size={22} color="#6366f1" />
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>
          ConsultHub
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none',
            color: isActive(l.to) ? '#6366f1' : '#94a3b8',
            background: isActive(l.to) ? '#6366f115' : 'transparent',
            fontWeight: isActive(l.to) ? 600 : 400,
            fontSize: '0.9rem',
            transition: 'all 0.15s',
          }}>
            {l.icon} {l.label}
          </Link>
        ))}
      </div>

      {/* User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
            {user?.fullName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {user?.role}
          </div>
        </div>
        <button onClick={handleLogout} style={{
          background: 'transparent', border: '1px solid #334155',
          borderRadius: '8px', padding: '0.5rem', cursor: 'pointer',
          color: '#ef4444', display: 'flex', alignItems: 'center',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#ef444415'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  )
}
