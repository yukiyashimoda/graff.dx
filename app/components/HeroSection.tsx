export default function HeroSection() {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
      <div className="relative z-10 text-center px-margin-mobile">
        <h1 className="font-display-xl text-[64px] md:text-display-xl uppercase leading-none mb-4">
          Visualizing<br />the Field
        </h1>
        <p className="font-subtext-jp text-subtext-jp text-on-surface-variant">
          現場の景色を、変える。
        </p>
      </div>

      <div className="absolute bottom-12 left-[24px] md:left-[80px] flex items-center gap-4 group cursor-pointer z-10">
        <span className="font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant group-hover:text-foreground transition-colors">
          Scroll to Discover
        </span>
        <span className="material-symbols-outlined text-accent-neon animate-bounce">south</span>
      </div>
    </section>
  )
}
