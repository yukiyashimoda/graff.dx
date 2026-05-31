'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealLine from './RevealLine'
import type { NewsItem } from '@/app/lib/db'

gsap.registerPlugin(ScrollTrigger)

export default function NewsSectionClient({ news }: { news: NewsItem[] }) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('.news-item')
    if (!items?.length) return

    gsap.set(items, { opacity: 0, y: 32 })

    const st = ScrollTrigger.create({
      trigger: listRef.current,
      start: 'top 82%',
      onEnter: () =>
        gsap.to(items, { opacity: 1, y: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out' }),
    })

    return () => st.kill()
  }, [])

  return (
    <section className="py-section-v-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex justify-between items-end mb-20">
        <div>
          <RevealLine className="mb-1">
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.3em]">
              004 — News
            </span>
          </RevealLine>
          <RevealLine delay={0.08}>
            <h2
              className="text-headline-lg-mobile md:text-display-lg uppercase leading-none mt-4"
              style={{ fontFamily: 'var(--ff-sora)' }}
            >
              NEWS
            </h2>
          </RevealLine>
        </div>
        <button className="hidden md:block font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant hover:text-accent-neon transition-colors">
          View All →
        </button>
      </div>

      <div ref={listRef} className="border-t border-outline-variant">
        {news.map((item) => (
          <div
            key={item.id}
            className="news-item group py-8 border-b border-outline-variant flex flex-col md:flex-row md:items-center gap-4 md:gap-16 cursor-pointer"
          >
            <span className="font-label-mono text-label-mono text-on-surface-variant shrink-0">
              {item.date}
            </span>
            <h3 className="font-body-main text-[18px] flex-grow group-hover:text-accent-neon transition-colors duration-300">
              {item.title}
            </h3>
            <span className="w-fit font-label-mono text-[10px] border border-outline-variant px-2 py-0.5 text-on-surface-variant uppercase tracking-widest">
              {item.tag}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-12 md:hidden">
        <button className="w-full py-4 border border-outline-variant font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant hover:border-accent-neon hover:text-accent-neon transition-all duration-300">
          View All News →
        </button>
      </div>
    </section>
  )
}
