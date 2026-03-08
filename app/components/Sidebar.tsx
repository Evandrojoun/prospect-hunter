'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/leads', label: 'Leads', icon: '👥' },
  { href: '/automacao', label: 'Automacao', icon: '⚡' },
  { href: '/relatorios', label: 'Relatorios', icon: '📈' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-56 bg-gray-900 text-white p-4 flex flex-col gap-1 shrink-0">
      <Link href="/" className="text-lg font-bold mb-6 px-3 hover:text-blue-400 transition-colors">
        🚀 O Caminho do Afiliado
      </Link>
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
    </nav>
  )
}
