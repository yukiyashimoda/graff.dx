'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function HeroSection() {
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const headRef    = useRef<HTMLHeadingElement>(null)
  const scrollRef  = useRef<HTMLDivElement>(null)
  const lineRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 3.5 })
    tl.from(lineRef.current,    { scaleY: 0, transformOrigin: 'top', duration: 0.8, ease: 'power3.out' })
      .from(taglineRef.current,  { opacity: 0, y: 16, duration: 0.7, ease: 'power3.out' }, '-=0.3')
      .from(headRef.current,     { opacity: 0, y: 48, duration: 1.0, ease: 'power3.out' }, '-=0.4')
      .from(scrollRef.current,   { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
  }, [])

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      {/* 縦ライン装飾 */}
      <div
        ref={lineRef}
        className="absolute left-[23px] md:left-[79px] top-0 bottom-0 w-px bg-outline-variant/40 z-10"
      />

      {/* コピー：左下固定 */}
      <div className="absolute bottom-20 left-[24px] md:left-[80px] z-10">
        <p
          ref={taglineRef}
          className="font-label-mono text-[11px] tracking-[0.25em] text-on-surface-variant mb-6 uppercase"
        >
          ビジョンを可視化するデザイン
        </p>
        <h1
          ref={headRef}
          className="text-[52px] md:text-[80px] lg:text-display-xl uppercase leading-[1.05] tracking-[0.08em]"
          style={{ fontFamily: 'var(--ff-share-tech)' }}
        >
          Visualizing<br />the Field
        </h1>
      </div>

      {/* スクロールインジケーター */}
      <div
        ref={scrollRef}
        className="absolute bottom-6 left-[24px] md:left-[80px] flex items-center gap-3 group cursor-pointer z-10"
      >
        <span className="font-label-mono text-[11px] uppercase tracking-widest text-on-surface-variant group-hover:text-foreground transition-colors">
          Scroll to Discover
        </span>
        <span className="material-symbols-outlined text-accent-neon text-base animate-bounce">south</span>
      </div>

      {/* 右上の座標ラベル */}
      <div className="absolute top-28 right-[24px] md:right-[80px] font-label-mono text-[10px] text-on-surface-variant/40 tracking-widest z-10 rotate-90 origin-right">
        35.6762° N, 139.6503° E
      </div>
    </section>
  )
}
