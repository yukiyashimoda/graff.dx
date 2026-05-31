'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Service } from '@/app/lib/db'

gsap.registerPlugin(ScrollTrigger)

export default function WorksSectionClient({ services }: { services: Service[] }) {
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
      <div ref={trackRef} className="flex flex-col md:flex-row h-full">

        {/* ─── 先頭パネル：セクションタイトル ─── */}
        <div className="relative flex-shrink-0 w-full md:w-[40vw] h-full flex flex-col justify-between px-margin-mobile md:px-margin-desktop py-24 border-b md:border-b-0 md:border-r border-outline-variant">
          <div>
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.3em]">
              002 — Services
            </span>
            <h2 className="mt-6 text-[13vw] md:text-[7vw] font-bold uppercase leading-none tracking-tight">
              SERVICES
            </h2>
            <p className="mt-6 font-body-sm text-body-sm text-on-surface-variant max-w-xs">
              お受けできる制作・開発のジャンルです。
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-on-surface-variant/40 font-label-mono text-[11px] uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">swipe_right</span>
            Scroll to explore
          </div>
        </div>

        {/* ─── サービスカード ─── */}
        {services.map((s, i) => (
          <div
            key={s.id}
            className="group relative flex-shrink-0 w-full md:w-[50vw] h-auto min-h-[70vh] md:h-full flex flex-col justify-between px-margin-mobile md:px-margin-desktop py-16 md:py-24 border-b md:border-b-0 md:border-r border-outline-variant overflow-hidden"
          >
            {/* 背景番号 */}
            <div
              className="absolute top-1/2 right-8 md:right-margin-desktop -translate-y-1/2 font-bold leading-none select-none pointer-events-none"
              style={{ fontSize: 'clamp(100px, 16vw, 220px)', color: 'rgba(255,255,255,0.025)', lineHeight: 1 }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* アイコン */}
            {s.icon && (
              <div className="text-[56px] md:text-[72px] leading-none select-none">{s.icon}</div>
            )}

            {/* コンテンツ */}
            <div className="relative z-10">
              <h3
                className="font-bold uppercase leading-none mb-6 tracking-tight"
                style={{ fontSize: 'clamp(28px, 4vw, 60px)' }}
              >
                {s.title}
              </h3>
              {s.description && (
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm leading-relaxed">
                  {s.description}
                </p>
              )}
            </div>

            {/* ホバーアクセントライン */}
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent-neon group-hover:w-full transition-all duration-700 ease-out" />
          </div>
        ))}

        {/* サービスがない場合のプレースホルダー */}
        {services.length === 0 && (
          <div className="flex-shrink-0 w-full md:w-[50vw] h-auto min-h-[70vh] md:h-full flex items-center justify-center px-margin-mobile md:px-margin-desktop border-b md:border-b-0 md:border-r border-outline-variant">
            <p className="font-label-mono text-label-mono text-on-surface-variant/30 uppercase tracking-widest">
              Admin からサービスを追加してください
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
