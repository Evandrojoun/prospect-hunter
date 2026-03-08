'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useTheme } from '@/app/components/ThemeProvider'

export default function ConfiguracoesPage() {
  const { theme, toggleTheme } = useTheme()

  // Dados do perfil
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState('')

  // Troca de senha
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email || '')
        setName(user.user_metadata?.name || '')
      }
    })
  }, [])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameMsg('Digite um nome.')
      return
    }
    setSavingName(true)
    setNameMsg('')
    try {
      const supabase = createSupabaseBrowser()
      const { error } = await supabase.auth.updateUser({
        data: { name: name.trim() },
      })
      if (error) {
        setNameMsg('Erro ao salvar: ' + error.message)
      } else {
        setNameMsg('Nome atualizado com sucesso!')
      }
    } catch {
      setNameMsg('Erro inesperado ao salvar.')
    } finally {
      setSavingName(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordMsg('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('As senhas nao coincidem.')
      return
    }
    setSavingPassword(true)
    setPasswordMsg('')
    try {
      const supabase = createSupabaseBrowser()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) {
        setPasswordMsg('Erro ao alterar senha: ' + error.message)
      } else {
        setPasswordMsg('Senha alterada com sucesso!')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPasswordMsg('Erro inesperado ao alterar senha.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Configuracoes</h2>

      <div className="grid gap-6 max-w-2xl">
        {/* Tema */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Aparencia</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo escuro</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Alterne entre o tema claro e escuro
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-label="Alternar tema"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Perfil */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Perfil</h3>
          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">O email nao pode ser alterado aqui.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Seu nome"
              />
            </div>
            {nameMsg && (
              <p className={`text-sm ${nameMsg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                {nameMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={savingName}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {savingName ? 'Salvando...' : 'Salvar nome'}
            </button>
          </form>
        </div>

        {/* Alterar senha */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Alterar senha</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nova senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Minimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Repita a nova senha"
              />
            </div>
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
                {passwordMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={savingPassword}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {savingPassword ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
