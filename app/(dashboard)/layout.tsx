import Sidebar from '../components/Sidebar'

// Layout das paginas protegidas - com sidebar
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto pt-14 md:pt-6">
        {children}
      </main>
    </div>
  )
}
