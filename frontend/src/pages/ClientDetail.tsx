import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, FileText } from 'lucide-react'
import { clientsService } from '@/services/clients.service'
import { problemMessage } from '@/lib/api'
import { FullPageLoading } from '@/components/ui/Spinner'

export default function ClientDetail() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = Number(idParam)

  const query = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsService.get(id),
    enabled: !!id,
  })

  if (query.isLoading) return <FullPageLoading />
  if (query.error || !query.data) {
    return <div className="p-8 max-w-4xl mx-auto text-rose-400">{problemMessage(query.error, 'Client not found')}</div>
  }
  const c = query.data

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/clients" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ArrowLeft size={14} /> Clients
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">{c.companyName}</h1>
        {c.contactName && <p className="text-slate-400 mt-1">{c.contactName}</p>}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {c.contactEmail && (
          <div className="card flex items-center gap-3">
            <Mail size={18} className="text-indigo-400" />
            <a href={`mailto:${c.contactEmail}`} className="text-slate-100 hover:text-indigo-300">{c.contactEmail}</a>
          </div>
        )}
        {c.contactPhone && (
          <div className="card flex items-center gap-3">
            <Phone size={18} className="text-indigo-400" />
            <span className="text-slate-100">{c.contactPhone}</span>
          </div>
        )}
      </div>

      {c.notes && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
            <FileText size={16} /> Notes
          </h2>
          <p className="text-slate-300 whitespace-pre-wrap">{c.notes}</p>
        </div>
      )}
    </div>
  )
}
