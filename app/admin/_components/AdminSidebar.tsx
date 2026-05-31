'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-surface-container-low border-r border-outline-variant flex flex-col z-50">
      <div className="p-6 border-b border-outline-variant">
        <span className="text-accent-neon font-bold tracking-widest text-sm uppercase">graff.admin</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, label }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded text-xs uppercase tracking-widest transition-colors ${
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

      <div className="p-4 border-t border-outline-variant">
        <form action={logout}>
          <button
            type="submit"
            className="w-full px-3 py-2 rounded text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-left"
          >
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
