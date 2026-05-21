export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end px-margin-mobile md:px-margin-desktop pb-24 overflow-hidden">
      <div className="relative z-10 max-w-4xl">
        <div className="mb-6">
          <p className="font-label-sm text-label-sm tracking-[0.4em] uppercase text-on-surface-variant mb-2">
            graphic design / web design / planner
          </p>
          <p className="font-label-sm text-label-sm tracking-[0.2em] text-primary-fixed opacity-70">
            ビジョンを可視化するデザイン
          </p>
        </div>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary uppercase leading-tight">
          Visualizing <br /> Your Vision
        </h1>
        <div className="mt-12 flex gap-8">
          <button className="px-8 py-4 border border-primary text-primary font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary/10 transition-all duration-500">
            Explore Works
          </button>
        </div>
      </div>
    </section>
  )
}
