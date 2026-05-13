import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import { projectsService } from '@/services/projects.service'
import { tasksService } from '@/services/tasks.service'
import { timeEntriesService } from '@/services/time-entries.service'
import { problemMessage } from '@/lib/api'
import { ProjectStatusBadge, TaskStatusBadge } from '@/components/ui/StatusBadge'
import { FullPageLoading, Spinner } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { formatMinutes, formatCents, formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']),
})
type TaskValues = z.infer<typeof taskSchema>

const timeSchema = z.object({
  minutes: z.coerce.number().int().min(1, 'Minutes must be ≥ 1'),
  workDate: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  billable: z.boolean().default(true),
  rateCents: z.coerce.number().int().min(0).optional().nullable(),
})
type TimeValues = z.infer<typeof timeSchema>

export default function ProjectDetail() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = Number(idParam)
  const { hasRole } = useAuth()
  const canEdit = hasRole('ADMIN', 'CONSULTANT')

  const projectQ = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsService.get(id),
    enabled: !!id,
  })

  const tasksQ = useQuery({
    queryKey: ['tasks', { projectId: id }],
    queryFn: () => tasksService.listByProject(id),
    enabled: !!id,
  })

  const timeQ = useQuery({
    queryKey: ['time-entries', { projectId: id }],
    queryFn: () => timeEntriesService.listByProject(id),
    enabled: !!id,
  })

  const summaryQ = useQuery({
    queryKey: ['time-entries', 'summary', id],
    queryFn: () => timeEntriesService.summary(id),
    enabled: !!id,
  })

  if (projectQ.isLoading) return <FullPageLoading />
  if (projectQ.error || !projectQ.data) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-rose-400">{problemMessage(projectQ.error, 'Project not found')}</p>
      </div>
    )
  }

  const project = projectQ.data
  const summary = summaryQ.data

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ArrowLeft size={14} /> Projects
      </Link>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-slate-100">{project.title}</h1>
          <ProjectStatusBadge status={project.status} />
        </div>
        {project.description && <p className="text-slate-400">{project.description}</p>}
        <div className="text-sm text-slate-500 mt-2 flex gap-4 flex-wrap">
          {project.clientName && <span>Client: <span className="text-slate-300">{project.clientName}</span></span>}
          {project.consultantName && <span>Consultant: <span className="text-slate-300">{project.consultantName}</span></span>}
        </div>
      </header>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <SummaryStat label="Hours logged" value={formatMinutes(summary.totalMinutes)} />
          <SummaryStat label="Billable" value={formatMinutes(summary.billableMinutes)} />
          <SummaryStat label="Revenue" value={formatCents(summary.totalRevenueCents)} />
        </div>
      )}

      <TasksSection projectId={id} tasks={tasksQ.data?.content ?? []} isLoading={tasksQ.isLoading} canEdit={canEdit} />

      <TimeSection projectId={id} entries={timeQ.data?.content ?? []} isLoading={timeQ.isLoading} />
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-100 mt-1">{value}</div>
    </div>
  )
}

function TasksSection({ projectId, tasks, isLoading, canEdit }: {
  projectId: number
  tasks: { id: number; title: string; description: string | null; status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'; dueDate: string | null; assigneeName: string | null }[]
  isLoading: boolean
  canEdit: boolean
}) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)

  const create = useMutation({
    mutationFn: (values: TaskValues) => tasksService.create(projectId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', { projectId }] })
      setOpen(false)
    },
  })

  const remove = useMutation({
    mutationFn: tasksService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', { projectId }] }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', status: 'TODO' },
  })

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <CheckCircle2 size={18} /> Tasks
        </h2>
        {canEdit && (
          <button onClick={() => setOpen(true)} className="btn-secondary">
            <Plus size={16} /> Add Task
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-slate-500"><Spinner /></div>
        ) : tasks.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No tasks" description="Break this project into actionable tasks." />
        ) : (
          <ul className="divide-y divide-slate-800/60">
            {tasks.map(t => (
              <li key={t.id} className="px-4 py-3 flex items-center gap-3">
                <TaskStatusBadge status={t.status} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100">{t.title}</div>
                  {t.description && <div className="text-xs text-slate-500 truncate">{t.description}</div>}
                </div>
                <div className="text-xs text-slate-500 hidden sm:block">{t.assigneeName ?? '—'}</div>
                <div className="text-xs text-slate-500 hidden sm:block">{formatDate(t.dueDate)}</div>
                {canEdit && (
                  <button onClick={() => remove.mutate(t.id)} aria-label="Delete task"
                          className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10">
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); reset() }} title="New Task">
        <form onSubmit={handleSubmit(v => create.mutate(v))} className="space-y-3">
          <div>
            <label className="form-label">Title</label>
            <input className="input" {...register('title')} />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="input min-h-[60px]" {...register('description')} />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="input" {...register('status')}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setOpen(false); reset() }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={create.isPending} className="btn-primary">
              {create.isPending ? <><Spinner /> Saving…</> : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

function TimeSection({ projectId, entries, isLoading }: {
  projectId: number
  entries: { id: number; minutes: number; workDate: string; description: string | null; billable: boolean; userName: string }[]
  isLoading: boolean
}) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)

  const create = useMutation({
    mutationFn: (values: TimeValues) =>
      timeEntriesService.create({ ...values, projectId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-entries', { projectId }] })
      qc.invalidateQueries({ queryKey: ['time-entries', 'summary', projectId] })
      qc.invalidateQueries({ queryKey: ['time-entries', 'mine'] })
      setOpen(false)
    },
  })

  const remove = useMutation({
    mutationFn: timeEntriesService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-entries', { projectId }] })
      qc.invalidateQueries({ queryKey: ['time-entries', 'summary', projectId] })
    },
  })

  const today = new Date().toISOString().slice(0, 10)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TimeValues>({
    resolver: zodResolver(timeSchema),
    defaultValues: { minutes: 60, workDate: today, billable: true },
  })

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Clock size={18} /> Time Entries
        </h2>
        <button onClick={() => setOpen(true)} className="btn-secondary">
          <Plus size={16} /> Log Time
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-slate-500"><Spinner /></div>
        ) : entries.length === 0 ? (
          <EmptyState icon={Clock} title="No time logged" description="Track time as you work on this project." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Duration</th>
                <th className="text-left px-4 py-3 font-semibold">Description</th>
                <th className="text-left px-4 py-3 font-semibold">Billable</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-300">{formatDate(e.workDate)}</td>
                  <td className="px-4 py-3 text-slate-400">{e.userName}</td>
                  <td className="px-4 py-3 font-medium text-slate-200">{formatMinutes(e.minutes)}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-md truncate">{e.description ?? '—'}</td>
                  <td className="px-4 py-3">
                    {e.billable ? <span className="badge badge-completed">Yes</span> : <span className="badge badge-todo">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove.mutate(e.id)} aria-label="Delete entry"
                            className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); reset() }} title="Log Time">
        <form onSubmit={handleSubmit(v => create.mutate(v))} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Date</label>
              <input type="date" className="input" {...register('workDate')} />
              {errors.workDate && <p className="form-error">{errors.workDate.message}</p>}
            </div>
            <div>
              <label className="form-label">Minutes</label>
              <input type="number" min={1} className="input" {...register('minutes')} />
              {errors.minutes && <p className="form-error">{errors.minutes.message}</p>}
            </div>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="input min-h-[60px]" {...register('description')} placeholder="What did you work on?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" {...register('billable')} className="accent-indigo-500" />
              Billable
            </label>
            <div>
              <label className="form-label">Rate (¢/hr)</label>
              <input type="number" min={0} className="input" {...register('rateCents')} placeholder="e.g. 15000 = $150" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setOpen(false); reset() }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={create.isPending} className="btn-primary">
              {create.isPending ? <><Spinner /> Saving…</> : 'Log Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
