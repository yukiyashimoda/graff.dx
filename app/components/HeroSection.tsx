'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const content = contentRef.current
    const card = cardRef.current
    if (!section || !content || !card) return

    const pinTrigger = ScrollTrigger.create({
      trigger: section,
      pin: content,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
    })

    const fadeTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        const s = 1 - p
        gsap.set(content, { opacity: s })
        card.style.boxShadow =
          `${8 * s}px ${8 * s}px ${16 * s}px var(--neu-shadow-dark), ` +
          `${-8 * s}px ${-8 * s}px ${16 * s}px var(--neu-shadow-light)`
      },
    })

    return () => {
      pinTrigger.kill()
      fadeTrigger.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[160vh] w-full">
      <div
        ref={contentRef}
        className="h-svh w-full flex items-center justify-center px-margin-mobile"
      >
        <div
          ref={cardRef}
          className="neu-raised rounded-[36px] md:rounded-[44px] px-14 py-16 md:px-24 md:py-20 flex flex-col items-center gap-7"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/graffLogo.svg"
            alt="graff"
            className="h-14 md:h-24 w-auto"
            style={{ filter: 'brightness(0)' }}
          />
          <p
            className="text-[12px] md:text-[15px] uppercase tracking-[0.35em] text-on-surface-variant"
            style={{ fontFamily: 'var(--ff-manrope)' }}
          >
            Application development, UI design
          </p>
        </div>
      </div>
    </section>
  )
}
