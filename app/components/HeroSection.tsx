'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const content = contentRef.current
    const logo = logoRef.current
    const tagline = taglineRef.current
    if (!section || !content || !logo || !tagline) return

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
        logo.style.filter =
          `brightness(0) ` +
          `drop-shadow(${-3 * s}px ${-3 * s}px ${4 * s}px var(--neu-shadow-light)) ` +
          `drop-shadow(${3 * s}px ${3 * s}px ${4 * s}px var(--neu-shadow-dark))`
        tagline.style.textShadow =
          `${-2 * s}px ${-2 * s}px ${3 * s}px var(--neu-shadow-light), ` +
          `${2 * s}px ${2 * s}px ${3 * s}px var(--neu-shadow-dark)`
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
        className="h-svh w-full flex flex-col items-center justify-center gap-7 px-margin-mobile"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logoRef}
          src="/graffLogo.svg"
          alt="graff"
          className="h-14 md:h-24 w-auto"
          style={{
            filter:
              'brightness(0) drop-shadow(-3px -3px 4px var(--neu-shadow-light)) drop-shadow(3px 3px 4px var(--neu-shadow-dark))',
          }}
        />
        <p
          ref={taglineRef}
          className="text-[12px] md:text-[15px] uppercase tracking-[0.35em] text-on-surface-variant"
          style={{
            fontFamily: 'var(--ff-manrope)',
            textShadow:
              '-2px -2px 3px var(--neu-shadow-light), 2px 2px 3px var(--neu-shadow-dark)',
          }}
        >
          Application development, UI design
        </p>
      </div>
    </section>
  )
}
