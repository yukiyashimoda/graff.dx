'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const works = [
  { num: '01', title: 'graff.bms',         tag: 'PRODUCT',     accent: true,  desc: 'Bar Management System (OSS for restaurants)' },
  { num: '02', title: 'ichiyanagi-clinic', tag: 'CLIENT WORK', accent: false, desc: '内科消化器科クリニック' },
  { num: '03', title: 'Trioki',            tag: 'PRODUCT',     accent: true,  desc: 'LINE Mini App — Reservation system' },
  { num: '04', title: 'Avis',              tag: 'PRODUCT',     accent: true,  desc: 'Data analysis platform' },
]

export default function WorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      const section = sectionRef.current!
      const track   = trackRef.current!

      const getScrollDist = () => track.scrollWidth - window.innerWidth

      gsap.to(track, {
        x: () => -getScrollDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          end: () => `+=${getScrollDist()}`,
          invalidateOnRefresh: true,
        },
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden w-full h-auto md:h-screen">
      <div
        ref={trackRef}
        className="flex flex-col md:flex-row h-full"
      >
        {/* ─── 先頭パネル：セクションタイトル ─── */}
        <div className="relative flex-shrink-0 w-full md:w-[40vw] h-full flex flex-col justify-between px-margin-mobile md:px-margin-desktop py-24 border-b md:border-b-0 md:border-r border-outline-variant">
          <div>
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.3em]">
              002 — Works
            </span>
            <h2 className="mt-6 text-[13vw] md:text-[7vw] font-bold uppercase leading-none tracking-tight">
              WORKS
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-3 text-on-surface-variant/40 font-label-mono text-[11px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">swipe_right</span>
            Scroll to navigate
          </div>
        </div>

        {/* ─── ワークカード ─── */}
        {works.map((w, i) => (
          <div
            key={w.num}
            className="group relative flex-shrink-0 w-full md:w-screen h-auto min-h-[70vh] md:h-full flex flex-col justify-end px-margin-mobile md:px-margin-desktop py-16 md:py-24 border-b md:border-b-0 md:border-r border-outline-variant overflow-hidden"
          >
            {/* 巨大な番号 */}
            <div
              className="absolute top-1/2 left-margin-mobile md:left-margin-desktop -translate-y-1/2 font-bold leading-none select-none pointer-events-none"
              style={{
                fontSize: 'clamp(120px, 18vw, 260px)',
                color: 'rgba(255,255,255,0.03)',
                lineHeight: 1,
              }}
            >
              {w.num}
            </div>

            {/* コンテンツ */}
            <div className="relative z-10">
              <h3
                className="font-bold uppercase leading-none mb-5 tracking-tight"
                style={{ fontSize: 'clamp(32px, 5vw, 72px)' }}
              >
                {w.title}
              </h3>

              <div className="flex items-center gap-4 mb-6">
                <span
                  className={`font-label-mono text-[10px] border px-2 py-0.5 uppercase tracking-widest ${
                    w.accent
                      ? 'border-accent-neon text-accent-neon'
                      : 'border-on-surface-variant text-on-surface-variant'
                  }`}
                >
                  {w.tag}
                </span>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">{w.desc}</p>
            </div>

            {/* 進捗インジケーター（デスクトップ右下） */}
            <div className="absolute bottom-8 right-8 md:right-margin-desktop font-label-mono text-[11px] text-on-surface-variant/30 tracking-widest">
              {String(i + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
            </div>

            {/* ホバー時のアクセントライン */}
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent-neon group-hover:w-full transition-all duration-700 ease-out" />
          </div>
        ))}
      </div>
    </section>
  )
}
