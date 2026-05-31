'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { logout } from '@/app/actions/admin'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/works',     label: 'Works' },
  { href: '/admin/services',  label: 'Services' },
  { href: '/admin/news',      label: 'News' },
  { href: '/admin/contact',   label: 'Contact' },
]

export default function AdminSidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  // ページ遷移時に自動でクローズ
  useEffect(() => { setOpen(false) }, [path])

  // スクロールロック
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ─── モバイル専用トップバー ─── */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-surface-container-low border-b border-outline-variant flex items-center justify-between px-4 z-50">
        <span className="text-accent-neon font-bold tracking-widest text-sm uppercase">graff.admin</span>

        <button
          onClick={() => setOpen(v => !v)}
          className="w-10 h-10 flex flex-col justify-center items-center gap-[5px]"
          aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
        >
          <span className={`block w-5 h-px bg-on-surface transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`block w-5 h-px bg-on-surface transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-px bg-on-surface transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>
      </div>

      {/* ─── バックドロップ（モバイルのみ） ─── */}
      <div
        className={`md:hidden fixed inset-0 bg-background/70 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* ─── サイドバー本体 ─── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 md:w-56 bg-surface-container-low border-r border-outline-variant flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* ロゴ */}
        <div className="h-14 md:h-auto px-6 py-0 md:py-6 border-b border-outline-variant flex items-center md:block">
          <span className="text-accent-neon font-bold tracking-widest text-sm uppercase">graff.admin</span>
        </div>

        {/* ナビ */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label }) => {
            const active = path.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-3 md:py-2 rounded text-xs uppercase tracking-widest transition-colors ${
                  active
                    ? 'bg-accent-neon/10 text-accent-neon'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* ログアウト */}
        <div className="p-4 border-t border-outline-variant">
          <form action={logout}>
            <button
              type="submit"
              className="w-full px-3 py-3 md:py-2 rounded text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-left"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
