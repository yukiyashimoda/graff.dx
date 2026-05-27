'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ('ontouchstart' in window) return

    let mx = 0, my = 0, rx = 0, ry = 0
    let rafId: number
    let visible = false

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!visible) {
        visible = true
        if (ringRef.current) ringRef.current.style.opacity = '1'
        if (dotRef.current)  dotRef.current.style.opacity  = '1'
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px)`
      }
    }

    const loop = () => {
      rx += (mx - rx) * 0.08
      ry += (my - ry) * 0.08
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`
      }
      rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    rafId = requestAnimationFrame(loop)

    const addHover    = () => ringRef.current?.classList.add('is-hovering')
    const removeHover = () => ringRef.current?.classList.remove('is-hovering')

    const bindHover = () => {
      document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', addHover)
        el.addEventListener('mouseleave', removeHover)
      })
    }
    bindHover()

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" style={{ opacity: 0 }} />
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" style={{ opacity: 0 }} />
    </>
  )
}
