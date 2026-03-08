'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Workflow = {
  id: string
  name: string
  active: boolean
  steps: { dia: number; acao: string }[]
  created_at: string
}

// Workflows padrao para inserir se o banco estiver vazio
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

  const fetchWorkflows = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/workflows')
      if (res.ok) {
        const data = await res.json()
        if (data.length === 0) {
          // Cria workflows padrao se nao existirem
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
      // Busca novamente depois de criar
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
              {(wf.steps as { dia: number; acao: string }[]).map((step, i) => (
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
    </div>
  )
}
