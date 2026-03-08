'use client'

import { useState, useEffect, useCallback } from 'react'

function MetricCard({ title, value, subtitle, color }: {
  title: string
  value: string | number
  subtitle?: string
  color?: string
}) {
  return (
    <div className={`rounded-lg p-6 shadow-sm border ${color || 'bg-white border-gray-200'}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    leadsHoje: 0,
    leadsHot: 0,
    taxaConversao: '0%',
    convertidos: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
      }
    } catch (err) {
      console.error('Erro ao buscar metricas:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-400">
              Atualizado: {lastUpdate}
            </span>
          )}
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Leads Hoje"
          value={metrics.leadsHoje}
          subtitle="novos leads capturados"
          color="bg-blue-50 border-blue-200"
        />
        <MetricCard
          title="Total de Leads"
          value={metrics.totalLeads}
          subtitle="no banco de dados"
        />
        <MetricCard
          title="Leads Quentes"
          value={metrics.leadsHot}
          subtitle="score >= 80"
          color="bg-red-50 border-red-200"
        />
        <MetricCard
          title="Taxa de Conversao"
          value={metrics.taxaConversao}
          subtitle={`${metrics.convertidos} convertidos`}
          color="bg-green-50 border-green-200"
        />
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Proximas Acoes</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            1. Adicionar leads manualmente ou via importacao
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full" />
            2. Configurar workflows de automacao
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            3. Integrar com Meta para importar leads automaticamente
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            4. Conectar Evolution API para WhatsApp
          </li>
        </ul>
      </div>
    </div>
  )
}
