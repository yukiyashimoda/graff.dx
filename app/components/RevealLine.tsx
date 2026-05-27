'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function RevealLine({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    gsap.set(inner, { yPercent: 105 })

    const st = ScrollTrigger.create({
      trigger: outer,
      start: 'top 90%',
      onEnter: () =>
        gsap.to(inner, { yPercent: 0, duration: 1.1, delay, ease: 'power4.out' }),
    })

    return () => st.kill()
  }, [delay])

  return (
    <div ref={outerRef} className={`overflow-hidden ${className}`}>
      <div ref={innerRef}>{children}</div>
    </div>
  )
}
