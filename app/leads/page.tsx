'use client'

import { useState, useEffect, useCallback } from 'react'

type Lead = {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  source: string | null
  status: string | null
  score: number | null
  classification: string | null
  notes: string | null
  created_at: string | null
}

function scoreBadge(score: number | null) {
  if (!score) return { label: 'Sem score', color: 'bg-gray-200 text-gray-600' }
  if (score >= 80) return { label: 'Quente', color: 'bg-red-100 text-red-700' }
  if (score >= 50) return { label: 'Morno', color: 'bg-yellow-100 text-yellow-700' }
  return { label: 'Frio', color: 'bg-blue-100 text-blue-700' }
}

function statusBadge(status: string | null) {
  const map: Record<string, string> = {
    novo: 'bg-blue-100 text-blue-700',
    contatado: 'bg-yellow-100 text-yellow-700',
    qualificado: 'bg-purple-100 text-purple-700',
    convertido: 'bg-green-100 text-green-700',
    perdido: 'bg-gray-200 text-gray-500',
  }
  return map[status || 'novo'] || 'bg-gray-200 text-gray-600'
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterClassification, setFilterClassification] = useState('')

  // Modal de adicionar
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'manual',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.set('search', search)
      if (filterStatus) params.set('status', filterStatus)
      if (filterClassification) params.set('classification', filterClassification)

      const res = await fetch(`/api/leads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (err) {
      console.error('Erro ao buscar leads:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterStatus, filterClassification])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Debounce na busca
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({ name: '', phone: '', email: '', source: 'manual', notes: '' })
        setPage(1)
        fetchLeads()
      }
    } catch (err) {
      console.error('Erro ao adicionar lead:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteLead(id: string, name: string | null) {
    if (!confirm(`Tem certeza que quer deletar o lead "${name || 'sem nome'}"?`)) return
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (res.ok) fetchLeads()
    } catch (err) {
      console.error('Erro ao deletar lead:', err)
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) fetchLeads()
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Leads</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{total} leads encontrados</span>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            + Novo Lead
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer"
        >
          <option value="">Todos os status</option>
          <option value="novo">Novo</option>
          <option value="contatado">Contatado</option>
          <option value="qualificado">Qualificado</option>
          <option value="convertido">Convertido</option>
          <option value="perdido">Perdido</option>
        </select>
        <select
          value={filterClassification}
          onChange={(e) => { setFilterClassification(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer"
        >
          <option value="">Todas as temperaturas</option>
          <option value="hot">Quente</option>
          <option value="warm">Morno</option>
          <option value="cold">Frio</option>
        </select>
        {(search || filterStatus || filterClassification) && (
          <button
            onClick={() => {
              setSearchInput('')
              setSearch('')
              setFilterStatus('')
              setFilterClassification('')
              setPage(1)
            }}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-800 cursor-pointer"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">Telefone</th>
              <th className="text-left p-3 font-medium">Origem</th>
              <th className="text-left p-3 font-medium">Score</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Data</th>
              <th className="text-left p-3 font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  {search || filterStatus || filterClassification
                    ? 'Nenhum lead encontrado com esses filtros.'
                    : 'Nenhum lead ainda. Clique em "+ Novo Lead" para comecar.'}
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const badge = scoreBadge(lead.score)
                return (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{lead.name || '--'}</td>
                    <td className="p-3">{lead.phone || '--'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {lead.source || '--'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
                        {lead.score ?? '--'} {badge.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={lead.status || 'novo'}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${statusBadge(lead.status)}`}
                      >
                        <option value="novo">Novo</option>
                        <option value="contatado">Contatado</option>
                        <option value="qualificado">Qualificado</option>
                        <option value="convertido">Convertido</option>
                        <option value="perdido">Perdido</option>
                      </select>
                    </td>
                    <td className="p-3 text-gray-400">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '--'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteLead(lead.id, lead.name)}
                        className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacao */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-100 cursor-pointer"
          >
            Anterior
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 7) {
              pageNum = i + 1
            } else if (page <= 4) {
              pageNum = i + 1
            } else if (page >= totalPages - 3) {
              pageNum = totalPages - 6 + i
            } else {
              pageNum = page - 3 + i
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1 text-sm border rounded cursor-pointer ${
                  page === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-100 cursor-pointer"
          >
            Proximo
          </button>
        </div>
      )}

      {/* Modal Adicionar Lead */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Lead</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
              >
                x
              </button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do lead"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer"
                >
                  <option value="manual">Manual</option>
                  <option value="meta">Meta (Facebook/Instagram)</option>
                  <option value="google">Google</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Anotacoes sobre o lead..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Salvando...' : 'Salvar Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
