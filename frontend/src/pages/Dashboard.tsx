import { useQuery } from '@tanstack/react-query'
import { FolderKanban, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { projectsService } from '@/services/projects.service'
import { timeEntriesService } from '@/services/time-entries.service'
import { useAuth } from '@/hooks/useAuth'
import { ProjectStatusBadge } from '@/components/ui/StatusBadge'
import { FullPageLoading } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { formatMinutes } from '@/lib/utils'

export default function Dashboard() {
  const { user } = useAuth()

  const projectsQuery = useQuery({
    queryKey: ['projects', { size: 100 }],
    queryFn: () => projectsService.list({ size: 100, sort: 'createdAt,desc' }),
  })

  const timeQuery = useQuery({
    queryKey: ['time-entries', 'mine'],
    queryFn: () => timeEntriesService.listMine(),
  })

  if (projectsQuery.isLoading) return <FullPageLoading />

  const projects = projectsQuery.data?.content ?? []
  const entries = timeQuery.data?.content ?? []

  const counts = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    pending: projects.filter(p => p.status === 'PENDING').length,
  }
  const totalMinutes = entries.reduce((s, e) => s + e.minutes, 0)

  const stats = [
    { label: 'Total Projects', value: counts.total, icon: FolderKanban, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'In Progress', value: counts.inProgress, icon: TrendingUp, color: 'text-indigo-300 bg-indigo-500/10' },
    { label: 'Completed', value: counts.completed, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Hours Logged', value: formatMinutes(totalMinutes), icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Welcome back, {user?.fullName.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your projects today.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100 leading-none">{s.value}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-slate-100 mb-4">Recent Projects</h2>
        {projects.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No projects yet"
            description="Create your first project to get started."
            action={<Link to="/projects" className="btn-primary">Go to projects</Link>}
          />
        ) : (
          <div className="space-y-2">
            {projects.slice(0, 5).map(p => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="flex items-center justify-between p-3 bg-slate-950 rounded-md border border-slate-800/50
                           hover:border-indigo-500/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-100 truncate">{p.title}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {p.description?.slice(0, 80) ?? 'No description'}
                  </div>
                </div>
                <ProjectStatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
