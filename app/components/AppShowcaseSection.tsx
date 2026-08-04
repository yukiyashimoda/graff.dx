'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import RevealLine from './RevealLine'
import FlowIn from './FlowIn'
import PhoneMockup from './PhoneMockup'
import { SHOWCASE_APPS } from '../lib/apps'

gsap.registerPlugin(ScrollTrigger)

export default function AppShowcaseSection() {
  const phoneRootRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      const phoneRoot = phoneRootRef.current
      if (!phoneRoot) return

      const imgLayers = Array.from(
        phoneRoot.querySelectorAll<HTMLElement>('[data-screen-index]'),
      )

      const showScreen = (index: number) => {
        imgLayers.forEach((img) => {
          const idx = Number(img.dataset.screenIndex)
          gsap.to(img, { opacity: idx === index ? 1 : 0, duration: 0.6, overwrite: true })
        })
      }

      const chapterTriggers = chapterRefs.current.map((chapterEl, i) => {
        if (!chapterEl) return null
        return ScrollTrigger.create({
          trigger: chapterEl,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => showScreen(i),
          onEnterBack: () => showScreen(i),
        })
      })

      return () => {
        chapterTriggers.forEach((t) => t?.kill())
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section id="apps" className="py-section-v-padding">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-20">
        <RevealLine className="mb-1">
          <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.3em]">
            001 — Apps
          </span>
        </RevealLine>
        <RevealLine delay={0.08}>
          <h2
            className="text-headline-lg-mobile md:text-display-lg uppercase leading-none mt-4"
            style={{ fontFamily: 'var(--ff-sora)' }}
          >
            APPS
          </h2>
        </RevealLine>
      </div>

      {/* ─── デスクトップ：商品説明が左スクロール、スマホ3Dモックは右固定 ─── */}
      <div className="hidden md:grid md:grid-cols-[1fr_1fr] gap-16 px-margin-desktop max-w-container-max mx-auto">
        <div>
          {SHOWCASE_APPS.map((app, i) => (
            <div
              key={app.slug}
              ref={(el) => {
                chapterRefs.current[i] = el
              }}
              className="min-h-[90vh] flex flex-col justify-center py-16 border-b border-outline-variant last:border-b-0"
            >
              <ChapterCopy app={app} index={i} />
            </div>
          ))}
        </div>

        <div className="relative">
          <div ref={phoneRootRef} className="sticky top-0 h-svh flex items-center justify-center gap-6">
            <PhoneMockup screens={SHOWCASE_APPS.map((app) => app.screens[0])} />
            <PhoneMockup screens={SHOWCASE_APPS.map((app) => app.screens[1] ?? app.screens[0])} />
          </div>
        </div>
      </div>

      {/* ─── モバイル：静的スタック ─── */}
      <div className="md:hidden px-margin-mobile flex flex-col gap-20">
        {SHOWCASE_APPS.map((app, i) => (
          <FlowIn key={app.slug} delay={i * 0.06}>
            <div className="flex flex-col items-start text-left gap-8">
              <PhoneMockup screens={[app.screens[0]]} />
              <ChapterCopy app={app} index={i} />
            </div>
          </FlowIn>
        ))}
      </div>
    </section>
  )
}

function ChapterCopy({
  app,
  index,
}: {
  app: (typeof SHOWCASE_APPS)[number]
  index: number
}) {
  const detailHref = app.slug === 'wadachi-film' ? '/works/wadachi-film' : `/works/graff-lab#${app.slug}`

  return (
    <div className="max-w-md mx-0">
      <span className="font-label-mono text-[10px] md:text-label-mono text-on-surface-variant/60 tracking-widest">
        {String(index + 1).padStart(2, '0')}
      </span>
      <p className="font-label-mono text-[10px] md:text-label-mono text-on-surface-variant uppercase tracking-[0.2em] md:tracking-widest mt-2">
        {app.reading}
      </p>
      <h3 className="text-[24px] md:text-[40px] font-bold tracking-normal md:tracking-tight leading-snug mt-2 mb-4">
        {app.name}
      </h3>
      <p className="text-base md:text-lg leading-relaxed tracking-wide mb-4">{app.tagline}</p>
      <p className="text-on-surface-variant leading-[2] md:leading-[1.9] text-[13px] md:text-[15px] tracking-wide mb-6">
        {app.description}
      </p>

      <ul className="flex flex-wrap gap-2 mb-8 justify-start">
        {app.points.map((p) => (
          <li
            key={p}
            className="neu-raised-sm font-label-mono text-[10px] md:text-[11px] text-on-surface-variant rounded-full px-4 py-2 tracking-wide"
          >
            {p}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-4 justify-start">
        {app.optInUrl ? (
          <a
            href={app.optInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-raised inline-flex items-center gap-2 text-tertiary font-bold px-6 py-3 rounded-full hover:scale-[1.02] transition-transform"
          >
            テストに参加
            <span className="material-symbols-outlined text-base">open_in_new</span>
          </a>
        ) : app.comingSoon ? (
          <span className="neu-pressed inline-flex items-center gap-2 text-on-surface-variant font-bold px-6 py-3 rounded-full">
            Coming soon
          </span>
        ) : (
          <Link
            href={detailHref}
            className="neu-raised inline-flex items-center gap-2 text-foreground font-bold px-6 py-3 rounded-full hover:scale-[1.02] transition-transform"
          >
            詳しく見る
          </Link>
        )}
        {app.playStoreUrl && (
          <a
            href={app.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-raised inline-flex items-center gap-2 text-tertiary font-bold px-6 py-3 rounded-full hover:scale-[1.02] transition-transform"
          >
            Google Playで見る
            <span className="material-symbols-outlined text-base">open_in_new</span>
          </a>
        )}
      </div>

      {app.footnote && (
        <p className="text-on-surface-variant/70 text-[11px] leading-relaxed mt-6">
          {app.footnote}
        </p>
      )}
    </div>
  )
}
