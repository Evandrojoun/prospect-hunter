'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

const menuItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/leads', label: 'Leads', icon: '👥' },
  { href: '/automacao', label: 'Automacao', icon: '⚡' },
  { href: '/relatorios', label: 'Relatorios', icon: '📈' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario')
      }
    })
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="w-56 bg-gray-900 text-white p-4 flex flex-col shrink-0 h-screen">
      <Link href="/" className="text-lg font-bold mb-6 px-3 hover:text-blue-400 transition-colors">
        🚀 O Caminho do Afiliado
      </Link>

      <div className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Rodape: usuario + logout */}
      <div className="border-t border-gray-700 pt-3 mt-3">
        <p className="text-xs text-gray-400 px-3 mb-2 truncate" title={userName}>
          {userName}
        </p>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors text-sm cursor-pointer"
        >
          <span>🚪</span>
          <span>{loggingOut ? 'Saindo...' : 'Sair'}</span>
        </button>
      </div>
    </nav>
  )
}
