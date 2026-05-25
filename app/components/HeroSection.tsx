export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* コピー：左下固定 */}
      <div className="absolute bottom-20 left-[24px] md:left-[80px] z-10">
        <p className="font-label-mono text-[11px] tracking-[0.25em] text-on-surface-variant mb-4 uppercase">
          ビジョンを可視化するデザイン
        </p>
        <h1 className="font-display-xl text-[52px] md:text-[80px] lg:text-display-xl uppercase leading-[1.05] tracking-[0.08em] font-bold">
          Visualizing<br />the Field
        </h1>
      </div>

      {/* スクロールインジケーター：左下 */}
      <div className="absolute bottom-6 left-[24px] md:left-[80px] flex items-center gap-3 group cursor-pointer z-10">
        <span className="font-label-mono text-[11px] uppercase tracking-widest text-on-surface-variant group-hover:text-foreground transition-colors">
          Scroll to Discover
        </span>
        <span className="material-symbols-outlined text-accent-neon text-base animate-bounce">south</span>
      </div>
    </section>
  )
}
