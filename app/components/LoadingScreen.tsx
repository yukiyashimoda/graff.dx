'use client'
import { useLayoutEffect, useRef, useState } from 'react'

const LOADING_SEEN_KEY = 'graff-loading-seen'

export default function LoadingScreen() {
  const [logoIn,   setLogoIn]   = useState(false)
  const [slideOut, setSlideOut] = useState(false)
  const [gone,     setGone]     = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.sessionStorage.getItem(LOADING_SEEN_KEY) === '1') {
      // 描画前に隠し、トップへ戻ったときの一瞬の黒画面も防ぐ。
      if (overlayRef.current) overlayRef.current.style.display = 'none'
      return
    }

    const t1 = setTimeout(() => setLogoIn(true),   300)
    const t2 = setTimeout(() => setSlideOut(true), 2600)
    const t3 = setTimeout(() => {
      window.sessionStorage.setItem(LOADING_SEEN_KEY, '1')
      setGone(true)
    }, 3400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (gone) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center pointer-events-none"
      style={{
        opacity:    slideOut ? 0 : 1,
        transform:  slideOut ? 'translateY(-6%)' : 'translateY(0)',
        transition: slideOut
          ? 'opacity 0.7s ease, transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)'
          : 'none',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/graffLogo.svg"
        alt="graff"
        style={{
          filter:     'brightness(0) invert(1)',
          width:      '140px',
          opacity:    logoIn ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      />
    </div>
  )
}
