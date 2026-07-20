'use client'

import { useEffect, useRef, ReactNode } from 'react'

/**
 * 奥から手前へ流れてくる出現アニメーション。
 * [ScrollReveal] が上下のフェードなのに対し、こちらは奥行き（translateZ）を使い、
 * 波の上をカードが泳いでくるように見せる。
 */
export default function FlowIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 動きを抑える設定の人には即座に表示する
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('active')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`flow-in ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
