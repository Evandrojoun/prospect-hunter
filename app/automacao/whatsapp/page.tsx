'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WhatsAppPage() {
  const [status, setStatus] = useState<{
    connected: boolean
    configured: boolean
    state?: string
    message?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  // Teste de envio
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Ola! Este e um teste do Prospect Hunter.')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  async function checkStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {
      setStatus({ connected: false, configured: false, message: 'Erro ao verificar status' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  // Polling: verifica conexao a cada 5s quando tem QR code na tela
  useEffect(() => {
    if (!qrCode) return
    const interval = setInterval(async () => {
      const res = await fetch('/api/whatsapp/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
        if (data.connected) {
          setQrCode(null)
          clearInterval(interval)
        }
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [qrCode])

  async function connectWhatsApp() {
    setConnecting(true)
    try {
      const res = await fetch('/api/whatsapp/status', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.base64) {
          setQrCode(data.base64)
        } else if (data.code) {
          setQrCode(data.code)
        }
      }
    } catch {
      alert('Erro ao gerar QR Code. Verifique se a Evolution API esta rodando.')
    } finally {
      setConnecting(false)
    }
  }

  async function sendTestMessage() {
    if (!testPhone) return alert('Digite um numero de telefone')
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, message: testMessage }),
      })
      const data = await res.json()
      if (data.success) {
        setSendResult('Mensagem enviada com sucesso!')
      } else {
        setSendResult(`Erro: ${data.error || 'falha desconhecida'}`)
      }
    } catch {
      setSendResult('Erro de conexao ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/automacao" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Automacao
        </Link>
        <h2 className="text-2xl font-bold">WhatsApp</h2>
      </div>

      {/* Status da conexao */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Status da Conexao</h3>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 cursor-pointer"
          >
            {loading ? 'Verificando...' : 'Atualizar'}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Verificando conexao...</p>
        ) : !status?.configured ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="font-medium text-yellow-800">Evolution API nao configurada</p>
            <p className="text-sm text-yellow-700 mt-1">
              Adicione estas variaveis no arquivo <code className="bg-yellow-100 px-1 rounded">.env.local</code>:
            </p>
            <pre className="mt-2 bg-yellow-100 p-3 rounded text-sm text-yellow-900">
{`EVOLUTION_API_URL=http://SEU_IP:8080
EVOLUTION_API_KEY=sua-chave-secreta
EVOLUTION_INSTANCE_NAME=prospect-hunter`}
            </pre>
            <p className="text-sm text-yellow-700 mt-2">
              Depois reinicie o servidor (Ctrl+C e <code className="bg-yellow-100 px-1 rounded">npm run dev</code>).
            </p>
          </div>
        ) : status?.connected ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="font-medium text-green-800">WhatsApp conectado!</p>
              <p className="text-sm text-green-700">Pronto para enviar mensagens</p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              <p className="font-medium text-red-800">WhatsApp desconectado</p>
            </div>
            <button
              onClick={connectWhatsApp}
              disabled={connecting}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
            >
              {connecting ? 'Gerando QR Code...' : 'Conectar WhatsApp'}
            </button>
          </div>
        )}

        {/* QR Code */}
        {qrCode && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
            <p className="font-medium mb-3">Escaneie o QR Code com seu WhatsApp:</p>
            <p className="text-sm text-gray-500 mb-3">
              Abra o WhatsApp → Menu (3 pontinhos) → Aparelhos conectados → Conectar aparelho
            </p>
            {qrCode.startsWith('data:') ? (
              <img src={qrCode} alt="QR Code" className="mx-auto w-64 h-64" />
            ) : (
              <div className="bg-white p-4 rounded inline-block">
                <p className="text-xs font-mono break-all">{qrCode}</p>
              </div>
            )}
            <p className="text-sm text-gray-400 mt-3">
              Verificando conexao automaticamente...
            </p>
          </div>
        )}
      </div>

      {/* Teste de envio */}
      {status?.connected && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Teste de Envio</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero (com DDD)
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="11999999999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </div>
            <button
              onClick={sendTestMessage}
              disabled={sending}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer"
            >
              {sending ? 'Enviando...' : 'Enviar Mensagem Teste'}
            </button>
            {sendResult && (
              <p className={`text-sm ${sendResult.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                {sendResult}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
