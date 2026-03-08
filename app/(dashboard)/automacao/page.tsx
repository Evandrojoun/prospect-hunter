'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Step = { dia: number; acao: string }

type Workflow = {
  id: string
  name: string
  active: boolean
  steps: Step[]
  created_at: string
}

const defaultWorkflows = [
  {
    name: 'Boas-vindas Neuropatia',
    steps: [
      { dia: 1, acao: 'Mensagem educativa sobre neuropatia' },
      { dia: 3, acao: 'Depoimento de quem melhorou' },
      { dia: 7, acao: 'Call-to-action com oferta' },
    ],
  },
  {
    name: 'Re-engajamento',
    steps: [
      { dia: 1, acao: 'Pergunta: como esta se sentindo?' },
      { dia: 5, acao: 'Conteudo novo sobre tratamento' },
      { dia: 10, acao: 'Oferta especial limitada' },
    ],
  },
  {
    name: 'Pos-venda',
    steps: [
      { dia: 1, acao: 'Agradecimento + instrucoes de uso' },
      { dia: 7, acao: 'Como esta o resultado?' },
      { dia: 30, acao: 'Oferta de recompra' },
    ],
  },
]

export default function AutomacaoPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  // Estado do modal de edicao
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [editName, setEditName] = useState('')
  const [editSteps, setEditSteps] = useState<Step[]>([])
  const [saving, setSaving] = useState(false)

  const fetchWorkflows = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/workflows')
      if (res.ok) {
        const data = await res.json()
        if (data.length === 0) {
          await seedWorkflows()
          return
        }
        setWorkflows(data)
      }
    } catch (err) {
      console.error('Erro ao buscar workflows:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  async function seedWorkflows() {
    try {
      for (const wf of defaultWorkflows) {
        await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wf),
        })
      }
      const res = await fetch('/api/workflows')
      if (res.ok) {
        setWorkflows(await res.json())
      }
    } catch (err) {
      console.error('Erro ao criar workflows padrao:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  async function toggleWorkflow(id: string, currentActive: boolean) {
    setToggling(id)
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      })
      if (res.ok) {
        setWorkflows(prev =>
          prev.map(wf => wf.id === id ? { ...wf, active: !currentActive } : wf)
        )
      }
    } catch (err) {
      console.error('Erro ao alternar workflow:', err)
    } finally {
      setToggling(null)
    }
  }

  async function deleteWorkflow(id: string, name: string) {
    if (!confirm(`Deletar o workflow "${name}"?`)) return
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setWorkflows(prev => prev.filter(wf => wf.id !== id))
      }
    } catch (err) {
      console.error('Erro ao deletar workflow:', err)
    }
  }

  // Abre o modal de edicao com os dados do workflow
  function openEditModal(wf: Workflow) {
    setEditingWorkflow(wf)
    setEditName(wf.name)
    setEditSteps(wf.steps.map(s => ({ ...s })))
  }

  // Fecha o modal
  function closeEditModal() {
    setEditingWorkflow(null)
    setEditName('')
    setEditSteps([])
  }

  // Atualiza um campo de um step
  function updateStep(index: number, field: 'dia' | 'acao', value: string | number) {
    setEditSteps(prev => prev.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    ))
  }

  // Adiciona novo step
  function addStep() {
    const lastDia = editSteps.length > 0 ? editSteps[editSteps.length - 1].dia : 0
    setEditSteps(prev => [...prev, { dia: lastDia + 1, acao: '' }])
  }

  // Remove um step
  function removeStep(index: number) {
    if (editSteps.length <= 1) return alert('O workflow precisa ter pelo menos 1 etapa.')
    setEditSteps(prev => prev.filter((_, i) => i !== index))
  }

  // Salva as alteracoes
  async function saveEdit() {
    if (!editingWorkflow) return
    if (!editName.trim()) return alert('Digite um nome para o workflow.')
    if (editSteps.some(s => !s.acao.trim())) return alert('Preencha todas as acoes.')

    setSaving(true)
    try {
      const res = await fetch(`/api/workflows/${editingWorkflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          steps: editSteps.map(s => ({ dia: Number(s.dia), acao: s.acao.trim() })),
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setWorkflows(prev =>
          prev.map(wf => wf.id === updated.id ? updated : wf)
        )
        closeEditModal()
      }
    } catch (err) {
      console.error('Erro ao salvar workflow:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Automacao</h2>
        <p className="text-gray-400">Carregando workflows...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Banner WhatsApp */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex justify-between items-center">
        <div>
          <p className="font-medium text-green-800">Conexao WhatsApp (Evolution API)</p>
          <p className="text-sm text-green-700">Configure o WhatsApp para ativar o envio automatico de mensagens</p>
        </div>
        <Link
          href="/automacao/whatsapp"
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          Configurar WhatsApp
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Workflows</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {workflows.filter(w => w.active).length} de {workflows.length} ativos
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className={`rounded-lg p-6 shadow-sm border transition-colors ${
              wf.active ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{wf.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    wf.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {wf.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Botao Editar */}
                <button
                  onClick={() => openEditModal(wf)}
                  className="text-blue-500 hover:text-blue-700 text-sm cursor-pointer"
                >
                  Editar
                </button>
                {/* Toggle switch */}
                <button
                  onClick={() => toggleWorkflow(wf.id, wf.active)}
                  disabled={toggling === wf.id}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    wf.active ? 'bg-green-500' : 'bg-gray-300'
                  } ${toggling === wf.id ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      wf.active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <button
                  onClick={() => deleteWorkflow(wf.id, wf.name)}
                  className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {(wf.steps as Step[]).map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-16 text-gray-400 shrink-0">Dia {step.dia}</span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      wf.active ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                  />
                  <span className={wf.active ? 'text-gray-700' : 'text-gray-500'}>
                    {step.acao}
                  </span>
                </div>
              ))}
            </div>

            {!wf.active && (
              <p className="text-xs text-gray-400 mt-4">
                Clique no toggle para ativar este workflow
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Edicao */}
      {editingWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Editar Workflow</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
              >
                x
              </button>
            </div>

            {/* Nome do workflow */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Workflow
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Boas-vindas Neuropatia"
              />
            </div>

            {/* Etapas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etapas do Workflow
              </label>
              <div className="space-y-3">
                {editSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                    <div className="shrink-0">
                      <label className="block text-xs text-gray-500 mb-1">Dia</label>
                      <input
                        type="number"
                        value={step.dia}
                        onChange={(e) => updateStep(i, 'dia', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Acao</label>
                      <input
                        type="text"
                        value={step.acao}
                        onChange={(e) => updateStep(i, 'acao', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="O que enviar neste dia..."
                      />
                    </div>
                    <button
                      onClick={() => removeStep(i)}
                      className="mt-5 text-red-400 hover:text-red-600 text-sm cursor-pointer shrink-0"
                      title="Remover etapa"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addStep}
                className="mt-3 px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 cursor-pointer"
              >
                + Adicionar etapa
              </button>
            </div>

            {/* Botoes */}
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Salvando...' : 'Salvar Alteracoes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
