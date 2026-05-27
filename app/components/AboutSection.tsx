import RevealLine from './RevealLine'

export default function AboutSection() {
  return (
    <section className="py-section-v-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* セクションラベル */}
      <RevealLine className="mb-20">
        <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.3em]">
          001 — About
        </span>
      </RevealLine>

      <div className="grid md:grid-cols-[1fr_1px_1fr] gap-0 md:gap-16 items-start">
        {/* 左：見出し */}
        <div>
          <RevealLine className="mb-2" delay={0.05}>
            <h2
              className="text-[9vw] md:text-[4.5vw] lg:text-[54px] font-semibold leading-[1.12] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--ff-sora)' }}
            >
              アナログな現場に、<br />
              デジタルの解像度を。
            </h2>
          </RevealLine>
        </div>

        {/* 仕切り線 */}
        <div className="hidden md:block w-px bg-outline-variant self-stretch" />

        {/* 右：本文 ＋ CTA */}
        <div className="mt-12 md:mt-0 flex flex-col gap-12 justify-between">
          <RevealLine delay={0.12}>
            <p className="font-body-main text-body-main text-on-surface-variant leading-[1.9] max-w-[480px]">
              graffは、現場の課題を構造で解くための個人プロジェクトです。
              15年の飲食業界経験を起点に、複数のプロダクトと制作実績を通じて、
              現場の景色を変える試みを続けています。
            </p>
          </RevealLine>

          {/* 数値ハイライト */}
          <RevealLine delay={0.2}>
            <div className="grid grid-cols-3 gap-8 border-t border-outline-variant pt-8">
              {[
                { num: '15+', label: 'Years in field' },
                { num: '4',   label: 'Active products' },
                { num: '∞',   label: 'Iterations' },
              ].map(item => (
                <div key={item.label}>
                  <div className="font-display-lg text-[32px] md:text-[40px] font-bold text-foreground leading-none mb-2">
                    {item.num}
                  </div>
                  <div className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </RevealLine>

          <RevealLine delay={0.28}>
            <a
              className="inline-flex items-center gap-4 border border-accent-neon px-10 py-4 font-label-mono text-label-mono uppercase tracking-widest text-accent-neon hover:bg-accent-neon hover:text-background transition-all duration-300 w-fit"
              href="#"
            >
              About <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </RevealLine>
        </div>
      </div>
    </section>
  )
}
