import { forwardRef } from 'react'

/**
 * CSS描画の汎用スマホフレーム。screens[] を画面内に重ねて配置し、
 * data-screen-index を目印に呼び出し側（AppShowcaseSection）がクロスフェードさせる。
 */
const PhoneMockup = forwardRef<
  HTMLDivElement,
  { screens: string[]; alt?: string; className?: string }
>(function PhoneMockup({ screens, alt = '', className = '' }, ref) {
  return (
    <div
      ref={ref}
      className={`neu-raised relative mx-auto w-[150px] md:w-[190px] aspect-[9/19.5] rounded-[32px] p-[7px] ${className}`}
    >
      {/* 側面ボタン */}
      <span className="absolute -right-px top-[64px] w-[2px] h-[36px] rounded-r-sm bg-outline-variant" />
      <span className="absolute -left-px top-[55px] w-[2px] h-[20px] rounded-l-sm bg-outline-variant" />
      <span className="absolute -left-px top-[80px] w-[2px] h-[30px] rounded-l-sm bg-outline-variant" />

      {/* 画面 */}
      <div className="relative w-full h-full overflow-hidden rounded-[25px] bg-surface-container-highest">
        {screens.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${i}`}
            src={src}
            alt={alt}
            data-screen-index={i}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}
        {/* パンチホールカメラ */}
        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-background/85 border border-outline-variant/60 z-10" />
      </div>
    </div>
  )
})

export default PhoneMockup
