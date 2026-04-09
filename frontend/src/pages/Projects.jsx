import { useState, useEffect } from 'react'
import { projectAPI } from '../services/api'
import { Plus, Pencil, Trash2, X, Loader, FolderOpen } from 'lucide-react'

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

const emptyForm = { title: '', description: '', status: 'PENDING' }

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)

  const load = () => {
    setLoading(true)
    projectAPI.getAll()
      .then(r => setProjects(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true) }
  const openEdit   = (p) => { setForm({ title: p.title, description: p.description, status: p.status }); setEditing(p.id); setShowModal(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) await projectAPI.update(editing, form)
      else         await projectAPI.create(form)
      setShowModal(false)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    await projectAPI.delete(id)
    load()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f1f5f9' }}>Projects</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Manage all consulting projects
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</p>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No projects yet. Create your first!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Title', 'Description', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < projects.length - 1 ? '1px solid #1e293b' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffffff05'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 500, color: '#f1f5f9' }}>{p.title}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', maxWidth: '300px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {p.description || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(p)} style={{ background: '#6366f120', border: 'none', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#6366f1', cursor: 'pointer' }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{ background: '#ef444420', border: 'none', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, color: '#f1f5f9' }}>{editing ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Title</label>
                <input className="input" placeholder="Project title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Description</label>
                <textarea className="input" rows={3} placeholder="Describe the project…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Status</label>
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {saving ? <><Loader size={14} /> Saving…</> : 'Save Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
