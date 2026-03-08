'use client'

import { useState } from 'react'

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

        {/* Neuro Validation */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Validacao Neurocientifica</h3>
              <p className="text-sm text-gray-500">
                Integracao com vaiconverter.com.br
              </p>
            </div>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
              Em breve
            </span>
          </div>
          <div className="bg-gray-50 rounded p-4 text-center">
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-gray-400">Score neuro</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Sera conectado quando a integracao estiver pronta
          </p>
        </div>
      </div>
    </div>
  )
}
