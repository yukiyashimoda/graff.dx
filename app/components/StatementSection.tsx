'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DissolveText from './DissolveText'

gsap.registerPlugin(ScrollTrigger)

export default function StatementSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const content = contentRef.current
    if (!section || !content) return

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
      onUpdate: ({ progress }) => {
        const fadeProgress = Math.max(0, (progress - 0.28) / 0.72)
        gsap.set(content, { opacity: 1 - fadeProgress })
      },
    })

    return () => {
      pinTrigger.kill()
      fadeTrigger.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[170svh] w-full" aria-label="Statement">
      <div
        ref={contentRef}
        className="h-svh w-full flex touch-pan-y items-center justify-center overflow-hidden text-center px-margin-mobile"
      >
        <DissolveText
          triggerRef={sectionRef}
          className="max-w-[820px] select-none text-[5.6vw] md:text-[32px] leading-[1.7] tracking-tight"
          style={{ fontFamily: 'var(--ff-manrope)' }}
        >
          無駄のない画面。
          <br />
          手放せない手触り。
          <br />
          <br />
          時代を超えて愛される
          <br />
          文具のように、
          <br />
          あなたの手に
          <br />
          馴染むプロダクトを。
        </DissolveText>
      </div>
    </section>
  )
}
