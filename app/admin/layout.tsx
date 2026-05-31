import type { ReactNode } from 'react'
import AdminSidebar from './_components/AdminSidebar'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'graff.admin' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-on-surface" style={{ fontFamily: 'var(--ff-jetbrains)' }}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8 md:ml-56">
        {children}
      </main>
    </div>
  )
}
