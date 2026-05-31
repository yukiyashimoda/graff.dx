import type { ReactNode } from 'react'
import AdminSidebar from './_components/AdminSidebar'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'graff.admin' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-on-surface" style={{ fontFamily: 'var(--ff-jetbrains)' }}>
      <AdminSidebar />
      {/* モバイル: pt-14でトップバー分を確保。デスクトップ: ml-56でサイドバー分を確保 */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0 md:ml-56 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
