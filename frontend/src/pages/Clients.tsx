import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react'
import { clientsService } from '@/services/clients.service'
import { problemMessage } from '@/lib/api'
import { FullPageLoading, Spinner } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import type { Client } from '@/types/client'

const clientSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof clientSchema>

export default function Clients() {
  const { hasRole } = useAuth()
  const canManage = hasRole('ADMIN', 'CONSULTANT')

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)

  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['clients', { search }],
    queryFn: () => clientsService.list({ q: search || undefined, size: 50, sort: 'companyName' }),
  })

  const create = useMutation({
    mutationFn: clientsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); close() },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: FormValues }) => clientsService.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); close() },
  })

  const remove = useMutation({
    mutationFn: clientsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })

  const close = () => { setModalOpen(false); setEditing(null) }
  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (c: Client) => { setEditing(c); setModalOpen(true) }

  const onDelete = (c: Client) => {
    if (confirm(`Delete client "${c.companyName}"? Linked projects will lose their client reference.`)) {
      remove.mutate(c.id)
    }
  }

  if (query.isLoading) return <FullPageLoading />
  const clients = query.data?.content ?? []

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Clients</h1>
          <p className="text-sm text-slate-500 mt-1">Companies you're consulting for</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> New Client
          </button>
        )}
      </header>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          placeholder="Search company or contact…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9 max-w-md"
        />
      </div>

      <div className="card p-0 overflow-hidden">
        {clients.length === 0 ? (
          <EmptyState icon={Users} title="No clients yet" description="Add your first client to start tracking projects." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <th className="text-left px-4 py-3 font-semibold">Company</th>
                <th className="text-left px-4 py-3 font-semibold">Contact</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-right px-4 py-3 font-semibold w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <Link to={`/clients/${c.id}`} className="font-medium text-slate-100 hover:text-indigo-300">
                      {c.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.contactName ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{c.contactEmail ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      {canManage && (
                        <button onClick={() => openEdit(c)} aria-label="Edit"
                                className="p-1.5 rounded-md text-indigo-400 hover:bg-indigo-500/10">
                          <Pencil size={14} />
                        </button>
                      )}
                      {hasRole('ADMIN') && (
                        <button onClick={() => onDelete(c)} aria-label="Delete"
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

      <ClientFormModal
        open={modalOpen}
        onClose={close}
        initial={editing}
        isSubmitting={create.isPending || update.isPending}
        errorMessage={problemMessage(create.error ?? update.error, '')}
        onSubmit={values => {
          const cleaned: FormValues = { ...values, contactEmail: values.contactEmail || undefined }
          if (editing) update.mutate({ id: editing.id, input: cleaned })
          else create.mutate(cleaned)
        }}
      />
    </div>
  )
}

function ClientFormModal({ open, onClose, initial, isSubmitting, errorMessage, onSubmit }: {
  open: boolean
  onClose: () => void
  initial: Client | null
  isSubmitting: boolean
  errorMessage: string
  onSubmit: (v: FormValues) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    values: initial
      ? {
          companyName: initial.companyName,
          contactName: initial.contactName ?? '',
          contactEmail: initial.contactEmail ?? '',
          contactPhone: initial.contactPhone ?? '',
          notes: initial.notes ?? '',
        }
      : { companyName: '', contactName: '', contactEmail: '', contactPhone: '', notes: '' },
  })

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} title={initial ? 'Edit Client' : 'New Client'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {errorMessage && (
          <div role="alert" className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
            {errorMessage}
          </div>
        )}
        <div>
          <label className="form-label">Company Name</label>
          <input className="input" {...register('companyName')} />
          {errors.companyName && <p className="form-error">{errors.companyName.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Contact Name</label>
            <input className="input" {...register('contactName')} />
          </div>
          <div>
            <label className="form-label">Contact Email</label>
            <input type="email" className="input" {...register('contactEmail')} />
            {errors.contactEmail && <p className="form-error">{errors.contactEmail.message}</p>}
          </div>
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input className="input" {...register('contactPhone')} />
        </div>
        <div>
          <label className="form-label">Notes</label>
          <textarea className="input min-h-[80px]" {...register('notes')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => { onClose(); reset() }} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <><Spinner /> Saving…</> : 'Save Client'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
