import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Briefcase, LayoutDashboard, FolderKanban, Users, Clock, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/time', label: 'Time', icon: Clock },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-40 h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2">
        <Briefcase className="text-indigo-400" size={22} />
        <span className="text-base font-bold text-slate-100">ConsultHub</span>
      </Link>

      <div className="flex gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-500/10 text-indigo-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-slate-100">{user?.fullName}</div>
          <div className="text-xs text-slate-500">{user?.role}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out"
          className="p-2 rounded-md border border-slate-800 text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  )
}
