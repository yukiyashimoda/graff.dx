'use client'
import { useState } from 'react'

export default function TopNavBar() {
  const [, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[20px] bg-background/10">
      <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-gutter max-w-container-max mx-auto">
        <a className="font-display-lg text-display-lg-mobile tracking-widest text-primary" href="#">
          GRAFF.
        </a>
        <div className="hidden md:flex gap-12">
          <a className="nav-link relative font-label-sm text-label-sm tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary-fixed transition-colors duration-500" href="#news">
            News
          </a>
          <a className="nav-link relative font-label-sm text-label-sm tracking-[0.2em] uppercase text-primary border-b border-primary pb-1" href="#works">
            Works
          </a>
          <a className="nav-link relative font-label-sm text-label-sm tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary-fixed transition-colors duration-500" href="#contact">
            Contact
          </a>
        </div>
        <button className="md:hidden material-symbols-outlined text-primary" onClick={() => setOpen(v => !v)}>
          menu
        </button>
      </nav>
    </header>
  )
}
