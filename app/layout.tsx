import type { Metadata } from 'next'
import Sidebar from './components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prospect Hunter',
  description: 'Automacao de prospecao de leads',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-100 text-gray-900">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
