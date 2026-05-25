'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false })

export default function HeroSceneLoader() {
  const [active, setActive] = useState(true)

  useEffect(() => {
    let ticking = false
    const handler = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setActive(window.scrollY < window.innerHeight * 1.2)
        ticking = false
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return <HeroScene active={active} />
}
