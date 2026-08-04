'use client'

import { useEffect, useRef, ReactNode, RefObject } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

/** 画面を漂う文字がポインター操作で文章へ収束し、放置すると再び散開する。 */
export default function DissolveText({
  children,
  className = '',
  style,
  triggerRef,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  /**
   * GSAP ScrollTriggerの基準にする要素。指定しない場合は自分自身。
   * pin留めされて画面上で静止する要素に使う場合、自分自身の位置は
   * スクロールしても動かなくなるため、実際にスクロールで動く外側の
   * セクション要素をここに渡す（Hero/STATEMENTのピン留め構成で使用）。
   */
  triggerRef?: RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLParagraphElement>(null)

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

    const spreadX = Math.min(window.innerWidth * 0.47, 620)
    const spreadY = Math.min(window.innerHeight * 0.4, 380)
    const seeds = chars.map((_, index) => {
      // 再描画のたびに配置が跳ねない、文字番号由来の疑似乱数。
      const random = (salt: number) => {
        const value = Math.sin((index + 1) * 9283.31 + salt * 77.17) * 43758.5453
        return value - Math.floor(value)
      }
      return {
        x: (random(1) - 0.5) * spreadX * 2,
        y: (random(2) - 0.5) * spreadY * 2,
        rotation: (random(3) - 0.5) * 240,
        scale: 0.35 + random(4) * 0.5,
        opacity: 0.12 + random(5) * 0.24,
        driftX: (random(6) - 0.5) * 90,
        driftY: (random(7) - 0.5) * 80,
        driftRotation: (random(8) - 0.5) * 36,
        driftDuration: 3.8 + random(9) * 4.2,
      }
    })

    chars.forEach((char, index) => {
      const seed = seeds[index]
      gsap.set(char, {
        x: seed.x,
        y: seed.y,
        rotation: seed.rotation,
        scale: seed.scale,
        opacity: seed.opacity,
        filter: 'blur(1.5px)',
        transformOrigin: '50% 50%',
        willChange: 'transform, opacity, filter',
      })
    })

    const startDrifting = () => {
      chars.forEach((char, index) => {
        const seed = seeds[index]
        gsap.to(char, {
          x: seed.x + seed.driftX,
          y: seed.y + seed.driftY,
          rotation: seed.rotation + seed.driftRotation,
          duration: seed.driftDuration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })
    }

    let assembled = false
    let idleTimer: number | undefined

    const assemble = () => {
      if (assembled) return
      assembled = true
      gsap.killTweensOf(chars)
      gsap.to(chars, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.25,
        stagger: { each: 0.012, from: 'random' },
        ease: 'expo.out',
        overwrite: true,
        onComplete: () => gsap.set(chars, { clearProps: 'willChange' }),
      })
    }

    const scatter = () => {
      assembled = false
      gsap.killTweensOf(chars)
      gsap.to(chars, {
        x: (index) => seeds[index].x,
        y: (index) => seeds[index].y,
        rotation: (index) => seeds[index].rotation,
        scale: (index) => seeds[index].scale,
        opacity: (index) => seeds[index].opacity,
        filter: 'blur(1.5px)',
        duration: 1.5,
        stagger: { each: 0.008, from: 'random' },
        ease: 'power3.inOut',
        overwrite: true,
        onComplete: () => {
          if (!assembled) startDrifting()
        },
      })
    }

    const interact = () => {
      assemble()
      if (idleTimer !== undefined) window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(scatter, 4200)
    }

    startDrifting()
    trigger.addEventListener('pointermove', interact)
    trigger.addEventListener('pointerdown', interact)

    return () => {
      trigger.removeEventListener('pointermove', interact)
      trigger.removeEventListener('pointerdown', interact)
      if (idleTimer !== undefined) window.clearTimeout(idleTimer)
      gsap.killTweensOf(chars)
      split.revert()
    }
  }, [triggerRef])

  return <p ref={ref} className={className} style={style}>{children}</p>
}
