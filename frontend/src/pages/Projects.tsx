import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Search, FolderOpen } from 'lucide-react'
import { projectsService } from '@/services/projects.service'
import { clientsService } from '@/services/clients.service'
import { problemMessage } from '@/lib/api'
import { ProjectStatusBadge } from '@/components/ui/StatusBadge'
import { FullPageLoading, Spinner } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import type { Project } from '@/types/project'
import type { ProjectStatus } from '@/types/api'

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  clientId: z.coerce.number().int().positive().optional().nullable(),
})

type FormValues = z.infer<typeof projectSchema>

export default function Projects() {
  const { hasRole } = useAuth()
  const canCreate = hasRole('ADMIN', 'CONSULTANT')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('')
  const [editing, setEditing] = useState<Project | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['projects', { search, status: statusFilter }],
    queryFn: () => projectsService.list({
      q: search || undefined,
      status: statusFilter || undefined,
      size: 50,
      sort: 'createdAt,desc',
    }),
  })

  const clientsQuery = useQuery({
    queryKey: ['clients', 'all'],
    queryFn: () => clientsService.list({ size: 200 }),
    enabled: canCreate,
  })

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: FormValues }) =>
      projectsService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: projectsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  const closeModal = () => { setModalOpen(false); setEditing(null) }
  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (p: Project) => { setEditing(p); setModalOpen(true) }

  const onDelete = (p: Project) => {
    if (confirm(`Delete project "${p.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(p.id)
    }
  }

  if (query.isLoading) return <FullPageLoading />

  const projects = query.data?.content ?? []

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all consulting engagements</p>
        </div>
        {canCreate && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> New Project
          </button>
        )}
      </header>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title…"
            className="input pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as ProjectStatus | '')}
          className="input max-w-[200px]"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {projects.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects" description="Try adjusting your filters or create one." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Client</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr
                  key={p.id}
                  className={i < projects.length - 1 ? 'border-b border-slate-800/50 hover:bg-slate-800/30' : 'hover:bg-slate-800/30'}
                >
                  <td className="px-4 py-3">
                    <Link to={`/projects/${p.id}`} className="font-medium text-slate-100 hover:text-indigo-300">
                      {p.title}
                    </Link>
                    {p.description && (
                      <div className="text-xs text-slate-500 truncate max-w-md mt-0.5">{p.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.clientName ?? '—'}</td>
                  <td className="px-4 py-3"><ProjectStatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {canCreate && (
                        <button onClick={() => openEdit(p)} aria-label="Edit"
                                className="p-1.5 rounded-md text-indigo-400 hover:bg-indigo-500/10">
                          <Pencil size={14} />
                        </button>
                      )}
                      {hasRole('ADMIN') && (
                        <button onClick={() => onDelete(p)} aria-label="Delete"
                                className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ProjectFormModal
        open={modalOpen}
        onClose={closeModal}
        initial={editing}
        clients={clientsQuery.data?.content ?? []}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        errorMessage={problemMessage(createMutation.error ?? updateMutation.error, '')}
        onSubmit={values => {
          if (editing) updateMutation.mutate({ id: editing.id, input: values })
          else createMutation.mutate(values)
        }}
      />
    </div>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  initial: Project | null
  clients: { id: number; companyName: string }[]
  isSubmitting: boolean
  errorMessage: string
  onSubmit: (values: FormValues) => void
}

function ProjectFormModal({ open, onClose, initial, clients, isSubmitting, errorMessage, onSubmit }: ModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    values: initial
      ? {
          title: initial.title,
          description: initial.description ?? '',
          status: initial.status,
          clientId: initial.clientId,
        }
      : { title: '', description: '', status: 'PENDING', clientId: null },
  })

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} title={initial ? 'Edit Project' : 'New Project'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div role="alert" className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
            {errorMessage}
          </div>
        )}
        <div>
          <label className="form-label">Title</label>
          <input className="input" placeholder="Project title" {...register('title')} />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea className="input min-h-[88px]" rows={3} placeholder="Describe the project…" {...register('description')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Status</label>
            <select className="input" {...register('status')}>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="form-label">Client</label>
            <select className="input" {...register('clientId')}>
              <option value="">— None —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => { onClose(); reset() }} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <><Spinner /> Saving…</> : 'Save Project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
