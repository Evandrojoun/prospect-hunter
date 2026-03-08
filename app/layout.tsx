import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'O Caminho do Afiliado',
  description: 'Plataforma de automacao para afiliados digitais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  )
}
