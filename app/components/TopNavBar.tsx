'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

/** light=true で白背景のページ用に配色を反転する（既定はダーク）。 */
export default function TopNavBar({ light = false }: { light?: boolean }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let ticking = false
    const handler = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 100)
        ticking = false
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-outline-variant ${
        scrolled
          ? light
            ? 'bg-white/80 backdrop-blur-md'
            : 'bg-background/80 backdrop-blur-md'
          : 'bg-transparent backdrop-blur-none border-transparent'
      }`}
    >
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-6 max-w-container-max mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/graffLogo.svg"
          alt="graff"
          className="h-5 w-auto"
          style={{ filter: light ? 'brightness(0)' : 'brightness(0) invert(1)' }}
        />
        <nav className="hidden md:flex gap-12 font-label-mono text-label-mono uppercase tracking-widest">
          <a className={light ? 'text-[#5457d6] border-b border-[#5457d6] pb-1' : 'text-accent-neon border-b border-accent-neon pb-1'} href="#">HOME</a>
          <a className={`transition-colors duration-300 ${light ? 'text-[#14151a]/60 hover:text-[#14151a]' : 'text-on-surface-variant hover:text-foreground'}`} href="#">ABOUT</a>
          <Link className={`transition-colors duration-300 ${light ? 'text-[#14151a]/60 hover:text-[#14151a]' : 'text-on-surface-variant hover:text-foreground'}`} href="/works">WORKS</Link>
        </nav>
        <button className={`font-label-mono text-label-mono uppercase tracking-widest hover:opacity-70 transition-opacity ${light ? 'text-[#5457d6]' : 'text-accent-neon'}`}>
          GET IN TOUCH
        </button>
      </div>
    </header>
  )
}
