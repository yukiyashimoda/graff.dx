'use client'

import { useEffect, useState } from 'react'

type Props = {
  codes: string[]
}

const STORAGE_KEY = 'graff-lab-calc-rate-promo-code'

export default function PromoCodeIssuer({ codes }: Props) {
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCode(window.localStorage.getItem(STORAGE_KEY))
  }, [])

  const issue = () => {
    if (code || codes.length === 0) return
    const next = codes[Math.floor(Math.random() * codes.length)]
    window.localStorage.setItem(STORAGE_KEY, next)
    setCode(next)
    setCopied(false)
  }

  const copy = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
  }

  return (
    <div className="rounded-2xl border border-[#14151a]/10 bg-white/70 p-5">
      {code ? (
        <div className="space-y-4">
          <p className="text-[#14151a] text-[14px] leading-[1.8]">
            発行されたコードです。この端末では再発行されません。
          </p>
          <code className="block rounded-xl border border-[#14151a]/10 bg-white px-4 py-4 font-label-mono text-[13px] text-[#14151a] break-all">
            {code}
          </code>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 bg-[#14151a] text-white font-bold px-6 py-3 rounded-full transition-colors"
            >
              {copied ? 'コピーしました' : 'コードをコピー'}
              <span className="material-symbols-outlined text-base">content_copy</span>
            </button>
            <a
              href={`https://play.google.com/redeem?code=${encodeURIComponent(code)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#14151a] text-[#14151a] font-bold px-6 py-3 rounded-full hover:bg-[#14151a] hover:text-white transition-colors"
            >
              Google Play で利用
              <span className="material-symbols-outlined text-base">open_in_new</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[#14151a] text-[14px] leading-[1.8]">
            ボタンを押すと、プロモーションコードが1つだけ表示されます。
          </p>
          <button
            type="button"
            onClick={issue}
            className="inline-flex items-center gap-2 bg-[#14151a] text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            コードを発行する
            <span className="material-symbols-outlined text-base">confirmation_number</span>
          </button>
        </div>
      )}
    </div>
  )
}
