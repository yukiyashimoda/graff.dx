'use client'

import { createElement, useEffect, useRef, ReactNode, ElementType, RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * 文字単位でふわっと出現し、セクションを抜けるスクロール量に応じて
 * 粒子のように散らばりながら消えていくテキスト。Hero / STATEMENT で使用。
 */
export default function DissolveText({
  children,
  className = '',
  as: Tag = 'div',
  style,
  triggerRef,
}: {
  children: ReactNode
  className?: string
  as?: ElementType
  style?: React.CSSProperties
  /**
   * GSAP ScrollTriggerの基準にする要素。指定しない場合は自分自身。
   * pin留めされて画面上で静止する要素に使う場合、自分自身の位置は
   * スクロールしても動かなくなるため、実際にスクロールで動く外側の
   * セクション要素をここに渡す（Hero/STATEMENTのピン留め構成で使用）。
   */
  triggerRef?: RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const trigger = triggerRef?.current ?? el

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1 })
      return
    }

    const split = SplitText.create(el, { type: 'chars' })
    const chars = split.chars as HTMLElement[]
    if (chars.length === 0) return

    const seeds = chars.map(() => ({
      dx: (Math.random() - 0.5) * 2,
      dy: -(0.5 + Math.random() * 0.7),
      rot: (Math.random() - 0.5) * 2,
    }))

    gsap.set(chars, { opacity: 0, y: 24 })

    let hasEntered = false

    const enterTrigger = ScrollTrigger.create({
      trigger,
      start: 'top 85%',
      onEnter: () => {
        hasEntered = true
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.015,
          ease: 'power3.out',
        })
      },
    })

    const dissolveTrigger = ScrollTrigger.create({
      trigger,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        if (!hasEntered) return
        const p = self.progress
        chars.forEach((c, i) => {
          const s = seeds[i]
          gsap.set(c, {
            x: s.dx * 140 * p,
            y: s.dy * 220 * p,
            rotation: s.rot * 120 * p,
            opacity: 1 - p,
          })
        })
      },
    })

    return () => {
      enterTrigger.kill()
      dissolveTrigger.kill()
      split.revert()
    }
  }, [])

  return createElement(Tag, { ref, className, style }, children)
}
