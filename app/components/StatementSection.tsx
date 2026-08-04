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

    return () => pinTrigger.kill()
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[160vh] w-full">
      <div
        ref={contentRef}
        className="h-svh w-full flex items-center justify-center text-center px-margin-mobile"
      >
        <DissolveText
          as="p"
          triggerRef={sectionRef}
          className="text-[7vw] md:text-[42px] leading-[1.6] tracking-tight"
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
