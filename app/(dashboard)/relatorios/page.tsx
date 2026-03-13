'use client'

import { useState, useEffect } from 'react'

function MetricBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className={`rounded p-4 text-center ${color || 'bg-gray-50 dark:bg-gray-800'}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}

interface MetaSummary {
  impressions: number
  clicks: number
  spend: number
  reach: number
  cpc: number
  cpm: number
  ctr: number
  leads: number
}

interface Campaign {
  id: string
  name: string
  status: string
  objective: string
  metrics: {
    impressions: number
    clicks: number
    spend: number
    ctr: number
    cpc: number
  } | null
}

export default function RelatoriosPage() {
  // Calculadora de ROI
  const [investimento, setInvestimento] = useState('')
  const [receita, setReceita] = useState('')
  const [leads, setLeads] = useState('')
  const [conversoes, setConversoes] = useState('')

  // Meta dados
  const [metaSummary, setMetaSummary] = useState<MetaSummary | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [metaLoading, setMetaLoading] = useState(true)
  const [metaError, setMetaError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState('')
  const [period, setPeriod] = useState('last_30d')

  // Buscar dados do Meta
  useEffect(() => {
    loadMetaData()
  }, [period])

  async function loadMetaData() {
    setMetaLoading(true)
    setMetaError('')
    try {
      const [summaryRes, campaignsRes] = await Promise.all([
        fetch(`/api/meta/summary?period=${period}`),
        fetch('/api/meta/campaigns'),
      ])

      const summaryData = await summaryRes.json()
      const campaignsData = await campaignsRes.json()

      if (summaryData.error) throw new Error(summaryData.error)
      if (campaignsData.error) throw new Error(campaignsData.error)

      setMetaSummary(summaryData)
      setCampaigns(campaignsData.campaigns || [])
    } catch (err) {
      setMetaError(err instanceof Error ? err.message : 'Erro ao carregar dados do Meta')
    } finally {
      setMetaLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult('')
    try {
      const res = await fetch('/api/meta/sync', { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSyncResult(data.message)
    } catch (err) {
      setSyncResult(err instanceof Error ? err.message : 'Erro na sincronizacao')
    } finally {
      setSyncing(false)
    }
  }

  const inv = parseFloat(investimento) || 0
  const rec = parseFloat(receita) || 0
  const numLeads = parseInt(leads) || 0
  const numConversoes = parseInt(conversoes) || 0

  const roi = inv > 0 ? (((rec - inv) / inv) * 100).toFixed(1) : '--'
  const cpl = numLeads > 0 ? (inv / numLeads).toFixed(2) : '--'
  const cpa = numConversoes > 0 ? (inv / numConversoes).toFixed(2) : '--'
  const taxaConversao = numLeads > 0 ? ((numConversoes / numLeads) * 100).toFixed(1) : '--'
  const roas = inv > 0 ? (rec / inv).toFixed(2) : '--'

  const periodLabels: Record<string, string> = {
    today: 'Hoje',
    yesterday: 'Ontem',
    last_7d: 'Ultimos 7 dias',
    last_14d: 'Ultimos 14 dias',
    last_30d: 'Ultimos 30 dias',
    this_month: 'Este mes',
    last_month: 'Mes passado',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Relatorios</h2>

      <div className="grid gap-4">
        {/* Meta Ads - Resumo */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <div>
              <h3 className="text-lg font-semibold">Meta Ads (Facebook/Instagram)</h3>
              <p className="text-sm text-gray-500">Dados em tempo real da sua conta de anuncios</p>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
              >
                {Object.entries(periodLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button
                onClick={loadMetaData}
                disabled={metaLoading}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {metaLoading ? 'Carregando...' : 'Atualizar'}
              </button>
            </div>
          </div>

          {metaError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded text-sm mb-4">
              {metaError}
            </div>
          )}

          {metaLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded p-4 text-center animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : metaSummary ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricBox
                label="Gasto Total"
                value={`R$ ${metaSummary.spend.toFixed(2)}`}
                color="bg-red-50 dark:bg-red-900/20"
              />
              <MetricBox
                label="Impressoes"
                value={metaSummary.impressions.toLocaleString('pt-BR')}
              />
              <MetricBox
                label="Cliques"
                value={metaSummary.clicks.toLocaleString('pt-BR')}
              />
              <MetricBox
                label="Alcance"
                value={metaSummary.reach.toLocaleString('pt-BR')}
              />
              <MetricBox
                label="CPC"
                value={`R$ ${metaSummary.cpc.toFixed(2)}`}
              />
              <MetricBox
                label="CPM"
                value={`R$ ${metaSummary.cpm.toFixed(2)}`}
              />
              <MetricBox
                label="CTR"
                value={`${metaSummary.ctr.toFixed(2)}%`}
                color={metaSummary.ctr > 1 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}
              />
              <MetricBox
                label="Leads (Meta)"
                value={metaSummary.leads.toString()}
                color={metaSummary.leads > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'}
              />
            </div>
          ) : null}
        </div>

        {/* Campanhas */}
        {campaigns.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Campanhas Ativas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2 px-3">Campanha</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-right py-2 px-3">Gasto</th>
                    <th className="text-right py-2 px-3">Cliques</th>
                    <th className="text-right py-2 px-3">CTR</th>
                    <th className="text-right py-2 px-3">CPC</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-b dark:border-gray-700">
                      <td className="py-2 px-3 font-medium">{c.name}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          c.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {c.status === 'ACTIVE' ? 'Ativa' : c.status === 'PAUSED' ? 'Pausada' : c.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {c.metrics ? `R$ ${c.metrics.spend.toFixed(2)}` : '--'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {c.metrics ? c.metrics.clicks.toLocaleString('pt-BR') : '--'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {c.metrics ? `${c.metrics.ctr.toFixed(2)}%` : '--'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {c.metrics ? `R$ ${c.metrics.cpc.toFixed(2)}` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sincronizar Leads do Meta */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold">Importar Leads do Meta</h3>
              <p className="text-sm text-gray-500">
                Busca leads dos formularios do Facebook/Instagram e salva no sistema
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 cursor-pointer"
            >
              {syncing ? 'Sincronizando...' : 'Sincronizar Leads'}
            </button>
          </div>
          {syncResult && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-sm">
              {syncResult}
            </div>
          )}
        </div>

        {/* Calculadora de ROI */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Calculadora de ROI</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Investimento em ads (R$)
              </label>
              <input
                type="number"
                value={investimento}
                onChange={(e) => setInvestimento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                placeholder="Ex: 500.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Receita gerada (R$)
              </label>
              <input
                type="number"
                value={receita}
                onChange={(e) => setReceita(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                placeholder="Ex: 2000.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total de leads gerados
              </label>
              <input
                type="number"
                value={leads}
                onChange={(e) => setLeads(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                placeholder="Ex: 50"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total de conversoes (vendas)
              </label>
              <input
                type="number"
                value={conversoes}
                onChange={(e) => setConversoes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                placeholder="Ex: 5"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className={`rounded p-4 text-center ${
              roi !== '--' && parseFloat(roi) > 0 ? 'bg-green-50 dark:bg-green-900/20' : roi !== '--' && parseFloat(roi) < 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'
            }`}>
              <p className={`text-2xl font-bold ${
                roi !== '--' && parseFloat(roi) > 0 ? 'text-green-700 dark:text-green-400' : roi !== '--' && parseFloat(roi) < 0 ? 'text-red-700 dark:text-red-400' : ''
              }`}>
                {roi}{roi !== '--' ? '%' : ''}
              </p>
              <p className="text-xs text-gray-400">ROI</p>
            </div>
            <MetricBox label="ROAS" value={roas !== '--' ? `${roas}x` : '--'} />
            <MetricBox label="CPL (Custo/Lead)" value={cpl !== '--' ? `R$ ${cpl}` : '--'} />
            <MetricBox label="CPA (Custo/Venda)" value={cpa !== '--' ? `R$ ${cpa}` : '--'} />
            <MetricBox label="Taxa Conversao" value={taxaConversao !== '--' ? `${taxaConversao}%` : '--'} />
          </div>
        </div>

        {/* Validacao Neurocientifica */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-lg font-semibold">Validacao Neurocientifica</h3>
              <p className="text-sm text-gray-500">
                Analise suas paginas e criativos com base em neurociencia aplicada ao marketing
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Baseado no metodo do Marcio Marcal (Manual do Marketing), descubra se sua landing page
            esta otimizada para atrair e converter seu publico usando principios da psique humana.
          </p>
          <a
            href="https://vaiconverter.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Analisar minha pagina
            <span>↗</span>
          </a>
          <p className="text-xs text-gray-400 mt-3">
            Abre o vaiconverter.com.br em uma nova aba
          </p>
        </div>
      </div>
    </div>
  )
}
