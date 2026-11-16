'use client'

import { useEffect, useRef, useState } from 'react'
import { Game } from './engine/Game'
import { City } from './engine/world/City'

export default function LegalRacingClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signalLeftRef = useRef<HTMLSpanElement>(null)
  const signalRightRef = useRef<HTMLSpanElement>(null)
  const violationNoticeRef = useRef<HTMLDivElement>(null)
  const speedLimitRef = useRef<HTMLSpanElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let game: Game | null = null

    City.load().then((city) => {
      if (cancelled || !canvasRef.current) return
      game = new Game(canvasRef.current, city, {
        turnSignalLeftEl: signalLeftRef.current,
        turnSignalRightEl: signalRightRef.current,
        violationNoticeEl: violationNoticeRef.current,
        speedLimitEl: speedLimitRef.current,
      })
      ;(window as unknown as { __legalRacingGame?: Game }).__legalRacingGame = game
      setLoading(false)
    })

    return () => {
      cancelled = true
      game?.dispose()
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0d1420', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            fontSize: '1rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.7)',
            pointerEvents: 'none',
          }}
        >
          LOADING…
        </div>
      )}

      <div
        ref={violationNoticeRef}
        className="legal-racing-violation"
        style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'monospace',
          fontSize: '1.1rem',
          letterSpacing: '0.08em',
          color: '#fff',
          background: 'rgba(198,50,40,0.85)',
          padding: '0.5rem 1.2rem',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        —
      </div>

      <div
        style={{
          position: 'absolute',
          top: '1.2rem',
          left: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: 'monospace',
          color: '#1c1c1c',
          background: '#fff',
          border: '4px solid #c23b2e',
          borderRadius: '4px',
          padding: '0.2rem 0.6rem',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: '0.55rem', letterSpacing: '0.1em' }}>LIMIT</span>
        <span ref={speedLimitRef} style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>
          --
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '2rem',
          fontFamily: 'monospace',
          fontSize: '2rem',
          color: 'rgba(255,255,255,0.12)',
          pointerEvents: 'none',
        }}
      >
        <span ref={signalLeftRef} className="legal-racing-signal">←</span>
        <span ref={signalRightRef} className="legal-racing-signal">→</span>
      </div>

      <style>{`
        .legal-racing-signal.is-active { color: #ff9d1f; text-shadow: 0 0 12px rgba(255,157,31,0.9); }
        .legal-racing-violation.is-active { opacity: 1; }
        .legal-racing-violation { transition: opacity 150ms ease; }
      `}</style>
    </div>
  )
}
