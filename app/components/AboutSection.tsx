export default function AboutSection() {
  return (
    <section className="py-section-v-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center flex flex-col items-center">
      <h2 className="font-headline-md text-headline-lg-mobile md:text-headline-md mb-12 max-w-4xl">
        アナログな現場に、<br className="md:hidden" />デジタルの解像度を。
      </h2>
      <p className="font-body-main text-body-main text-on-surface-variant max-w-[600px] mb-12 leading-relaxed">
        graffは、現場の課題を構造で解くための個人プロジェクトです。15年の飲食業界経験を起点に、複数のプロダクトと制作実績を通じて、現場の景色を変える試みを続けています。
      </p>
      <a
        className="inline-flex items-center gap-4 border border-accent-neon px-12 py-4 font-label-mono text-label-mono uppercase tracking-widest text-accent-neon hover:bg-accent-neon hover:text-background transition-all duration-300"
        href="#"
      >
        About <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </a>
    </section>
  )
}
