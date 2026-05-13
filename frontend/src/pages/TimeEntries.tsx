import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { timeEntriesService } from '@/services/time-entries.service'
import { FullPageLoading } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { formatMinutes, formatDate, formatCents } from '@/lib/utils'

export default function TimeEntries() {
  const query = useQuery({
    queryKey: ['time-entries', 'mine'],
    queryFn: () => timeEntriesService.listMine(),
  })

  if (query.isLoading) return <FullPageLoading />
  const entries = query.data?.content ?? []

  const totalMinutes = entries.reduce((s, e) => s + e.minutes, 0)
  const billableMinutes = entries.filter(e => e.billable).reduce((s, e) => s + e.minutes, 0)
  const revenue = entries
    .filter(e => e.billable && e.rateCents)
    .reduce((s, e) => s + Math.round((e.minutes * (e.rateCents ?? 0)) / 60), 0)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">My Time</h1>
        <p className="text-sm text-slate-500 mt-1">All hours you've logged across projects</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Stat label="Total logged" value={formatMinutes(totalMinutes)} />
        <Stat label="Billable" value={formatMinutes(billableMinutes)} />
        <Stat label="Revenue" value={formatCents(revenue)} />
      </div>

      <div className="card p-0 overflow-hidden">
        {entries.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No time logged yet"
            description="Open a project and click Log Time to add your first entry."
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Project</th>
                <th className="text-left px-4 py-3 font-semibold">Duration</th>
                <th className="text-left px-4 py-3 font-semibold">Description</th>
                <th className="text-left px-4 py-3 font-semibold">Billable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-300">{formatDate(e.workDate)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/projects/${e.projectId}`} className="text-slate-100 hover:text-indigo-300 font-medium">
                      {e.projectTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-200">{formatMinutes(e.minutes)}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-md truncate">{e.description ?? '—'}</td>
                  <td className="px-4 py-3">
                    {e.billable ? <span className="badge badge-completed">Yes</span> : <span className="badge badge-todo">No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-100 mt-1">{value}</div>
    </div>
  )
}
