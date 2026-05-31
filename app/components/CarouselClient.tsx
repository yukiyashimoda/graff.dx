'use client'
import Link from 'next/link'
import { useRef } from 'react'
import type { Work } from '@/app/lib/db'

export default function CarouselClient({ works }: { works: Work[] }) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 })

  const onDown  = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    drag.current = { active: true, startX: e.pageX - sliderRef.current.offsetLeft, scrollLeft: sliderRef.current.scrollLeft }
  }
  const onLeave = () => { drag.current.active = false }
  const onUp    = () => { drag.current.active = false }
  const onMove  = (e: React.MouseEvent) => {
    if (!drag.current.active || !sliderRef.current) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    sliderRef.current.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX) * 2
  }

  return (
    <section className="py-section-v-padding overflow-hidden">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-8 flex items-end justify-between">
        <div>
          <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.3em] block mb-1">
            003 — Works
          </span>
          <span className="font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mt-2">
            <span className="material-symbols-outlined text-sm">drag_pan</span> Drag to explore
          </span>
        </div>
        <Link
          href="/works"
          className="hidden md:block font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant hover:text-accent-neon transition-colors"
        >
          View All →
        </Link>
      </div>

      {works.length === 0 ? (
        <div className="px-margin-mobile md:px-margin-desktop">
          <p className="font-label-mono text-label-mono text-on-surface-variant/30 uppercase tracking-widest">
            Admin からポートフォリオを追加してください
          </p>
        </div>
      ) : (
        <div
          ref={sliderRef}
          className="flex gap-gutter overflow-x-auto no-scrollbar px-margin-mobile md:px-margin-desktop cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onDown}
          onMouseLeave={onLeave}
          onMouseUp={onUp}
          onMouseMove={onMove}
        >
          {works.map((work, i) => (
            <Link
              key={work.id}
              href={`/works/${work.slug}`}
              className="flex-none w-[300px] md:w-[600px] group"
              draggable={false}
            >
              <div className="aspect-video bg-muted-gray mb-6 relative overflow-hidden">
                {work.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="w-full h-full object-cover transition-all duration-700 pointer-events-none
                               grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
                    src={work.images[0]}
                    alt={work.title}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center select-none">
                    <span
                      className="font-bold leading-none text-on-surface-variant/10"
                      style={{ fontSize: 'clamp(60px, 10vw, 140px)', fontFamily: 'var(--ff-share-tech)' }}
                    >
                      {work.num || String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}
                {/* サイトトーン：暗め+teal被せ → ホバーで消える */}
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-700
                               bg-background/30 mix-blend-multiply
                               opacity-100 group-hover:opacity-0" />
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-700
                               bg-accent-neon/8
                               opacity-100 group-hover:opacity-0" />
              </div>
              <div className="flex items-baseline gap-4">
                <span className="font-label-mono text-label-mono text-on-surface-variant">
                  {work.num || String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="font-headline-md text-[24px] uppercase group-hover:text-accent-neon transition-colors duration-300">
                    {work.title}
                  </h4>
                  <p className="font-label-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-1">
                    {work.tag}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="px-margin-mobile md:px-margin-desktop mt-8 md:hidden">
        <Link
          href="/works"
          className="block w-full py-4 border border-outline-variant font-label-mono text-label-mono uppercase tracking-widest text-center text-on-surface-variant hover:border-accent-neon hover:text-accent-neon transition-all duration-300"
        >
          View All Works →
        </Link>
      </div>
    </section>
  )
}
