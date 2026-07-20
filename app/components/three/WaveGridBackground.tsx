'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// ssr: false は Client Component 内でのみ有効（Server Component ではエラーになる）。
const WaveGrid = dynamic(() => import('./WaveGrid'), { ssr: false })

/**
 * 背景に敷く波グリッド。position: fixed で画面に貼り付き、本文はこの上を流れる。
 * ・タブ非表示や画面外ではフレームループを止める
 * ・prefers-reduced-motion の環境では描画しない
 */
/**
 * 動きを減らす設定の環境では波を出さない。
 * 負荷は dpr 上限とフレームループ停止で抑えるので、端末性能での足切りはしない
 * （hardwareConcurrency は実機でも 2〜4 を返すことがあり、判定が粗すぎる）。
 */
function shouldRender() {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function WaveGridBackground() {
  // サーバーと初回描画は必ず null。マウント後に判定して出す（ハイドレーション不一致を避ける）。
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(true)

  useEffect(() => {
    const id = requestAnimationFrame(() => setEnabled(shouldRender()))
    const onVisibility = () => setActive(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  if (!enabled) return null

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-[#f4f4f5]" aria-hidden="true">
      <WaveGrid active={active} />
      {/* 本文が乗る帯をわずかに白へ寄せて可読性を上げる（波は透けたまま） */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f4f4f5]/55 via-transparent to-[#f4f4f5]/70" />
    </div>
  )
}
