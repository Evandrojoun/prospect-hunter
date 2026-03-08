'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegistroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createSupabaseBrowser()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: nome },
      },
    })

    if (error) {
      setError(
        error.message === 'User already registered'
          ? 'Este email ja esta cadastrado'
          : error.message
      )
      setLoading(false)
    } else {
      setSuccess(true)
      // Tenta login automatico
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!loginError) {
        router.push('/')
        router.refresh()
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-lg p-6 shadow-xl text-center">
          <h2 className="text-lg font-bold text-green-700 mb-2">Conta criada!</h2>
          <p className="text-sm text-gray-600 mb-4">
            Verifique seu email para confirmar o cadastro, ou aguarde o redirecionamento.
          </p>
          <Link href="/login" className="text-blue-600 hover:text-blue-800 text-sm">
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">O Caminho do Afiliado</h1>
          <p className="text-gray-400 mt-1">Crie sua conta</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-lg p-6 shadow-xl space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Ja tem conta?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
