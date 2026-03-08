'use client'

import { useState } from 'react'

type NeuroCategory = {
  nome: string
  score: number
  feedback: string
}

type NeuroResult = {
  score: number
  nivel: string
  resumo: string
  categorias: NeuroCategory[]
  melhorias: string[]
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-700 bg-green-50'
  if (score >= 60) return 'text-yellow-700 bg-yellow-50'
  if (score >= 40) return 'text-orange-700 bg-orange-50'
  return 'text-red-700 bg-red-50'
}

function scoreBorderColor(score: number) {
  if (score >= 80) return 'border-green-300'
  if (score >= 60) return 'border-yellow-300'
  if (score >= 40) return 'border-orange-300'
  return 'border-red-300'
}

function NeuroAnalyzer() {
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<NeuroResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    if (!url.trim()) return alert('Cole o link da pagina')

    let fullUrl = url.trim()
    if (!fullUrl.startsWith('http')) fullUrl = `https://${fullUrl}`

    setAnalyzing(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/neuro-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch {
      setError('Erro de conexao ao analisar a pagina')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Validacao Neurocientifica</h3>
        <p className="text-sm text-gray-500">
          Cole o link da sua pagina e a IA analisa usando principios de neuromarketing
        </p>
      </div>

      {/* Input do link */}
      <div className="flex gap-2 mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyze()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="https://sua-pagina.com.br"
        />
        <button
          onClick={analyze}
          disabled={analyzing}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
        >
          {analyzing ? 'Analisando...' : 'Analisar Pagina'}
        </button>
      </div>

      {/* Loading */}
      {analyzing && (
        <div className="text-center py-8">
          <p className="text-gray-500 animate-pulse">Analisando a pagina com IA... pode levar alguns segundos</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="space-y-4">
          {/* Score geral */}
          <div className={`rounded-lg p-6 text-center border ${scoreBorderColor(result.score)}`}>
            <p className={`text-5xl font-bold ${scoreColor(result.score).split(' ')[0]}`}>
              {result.score}
            </p>
            <p className="text-sm font-medium text-gray-600 mt-1">{result.nivel}</p>
            <p className="text-sm text-gray-500 mt-2">{result.resumo}</p>
          </div>

          {/* Categorias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.categorias.map((cat, i) => (
              <div key={i} className={`rounded-lg p-4 border ${scoreBorderColor(cat.score)}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{cat.nome}</span>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded ${scoreColor(cat.score)}`}>
                    {cat.score}
                  </span>
                </div>
                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      cat.score >= 80 ? 'bg-green-500' :
                      cat.score >= 60 ? 'bg-yellow-500' :
                      cat.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">{cat.feedback}</p>
              </div>
            ))}
          </div>

          {/* Melhorias sugeridas */}
          {result.melhorias && result.melhorias.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-800 mb-2">Melhorias Sugeridas</h4>
              <ul className="space-y-1">
                {result.melhorias.map((m, i) => (
                  <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">{'>'}</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}

export default function RelatoriosPage() {
  // Calculadora de ROI
  const [investimento, setInvestimento] = useState('')
  const [receita, setReceita] = useState('')
  const [leads, setLeads] = useState('')
  const [conversoes, setConversoes] = useState('')

  const inv = parseFloat(investimento) || 0
  const rec = parseFloat(receita) || 0
  const numLeads = parseInt(leads) || 0
  const numConversoes = parseInt(conversoes) || 0

  const roi = inv > 0 ? (((rec - inv) / inv) * 100).toFixed(1) : '--'
  const cpl = numLeads > 0 ? (inv / numLeads).toFixed(2) : '--'
  const cpa = numConversoes > 0 ? (inv / numConversoes).toFixed(2) : '--'
  const taxaConversao = numLeads > 0 ? ((numConversoes / numLeads) * 100).toFixed(1) : '--'
  const roas = inv > 0 ? (rec / inv).toFixed(2) : '--'

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Relatorios</h2>

      <div className="grid gap-4">
        {/* Calculadora de ROI */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Calculadora de ROI</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investimento em ads (R$)
              </label>
              <input
                type="number"
                value={investimento}
                onChange={(e) => setInvestimento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 500.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receita gerada (R$)
              </label>
              <input
                type="number"
                value={receita}
                onChange={(e) => setReceita(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 2000.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total de leads gerados
              </label>
              <input
                type="number"
                value={leads}
                onChange={(e) => setLeads(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 50"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total de conversoes (vendas)
              </label>
              <input
                type="number"
                value={conversoes}
                onChange={(e) => setConversoes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 5"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className={`rounded p-4 text-center ${
              roi !== '--' && parseFloat(roi) > 0 ? 'bg-green-50' : roi !== '--' && parseFloat(roi) < 0 ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              <p className={`text-2xl font-bold ${
                roi !== '--' && parseFloat(roi) > 0 ? 'text-green-700' : roi !== '--' && parseFloat(roi) < 0 ? 'text-red-700' : ''
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

        {/* Relatorio Meta */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Meta (Facebook/Instagram)</h3>
              <p className="text-sm text-gray-500">
                Metricas: Impressoes, Cliques, Conversoes, CPC, ROAS, CTR
              </p>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
              Em breve
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <MetricBox label="ROAS" value="--" />
            <MetricBox label="CPC" value="--" />
            <MetricBox label="CTR" value="--" />
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Import automatico sera configurado quando a integracao com Meta estiver pronta
          </p>
        </div>

        {/* Validacao Neurocientifica */}
        <NeuroAnalyzer />
      </div>
    </div>
  )
}
