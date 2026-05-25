'use client'
import { useState, useEffect } from 'react'

export default function TopNavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-outline-variant ${
        scrolled ? 'bg-background/80 backdrop-blur-md' : 'bg-transparent backdrop-blur-none border-transparent'
      }`}
    >
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-6 max-w-container-max mx-auto">
        <div className="font-headline-md text-body-main font-bold tracking-tighter text-foreground">graff</div>
        <nav className="hidden md:flex gap-12 font-label-mono text-label-mono uppercase tracking-widest">
          <a className="text-accent-neon border-b border-accent-neon pb-1" href="#">HOME</a>
          <a className="text-on-surface-variant hover:text-foreground transition-colors duration-300" href="#">ABOUT</a>
          <a className="text-on-surface-variant hover:text-foreground transition-colors duration-300" href="#">WORKS</a>
        </nav>
        <button className="font-label-mono text-label-mono uppercase tracking-widest text-accent-neon hover:opacity-70 transition-opacity">
          GET IN TOUCH
        </button>
      </div>
    </header>
  )
}
