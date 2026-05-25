const news = [
  { date: '2026.10.24', title: 'graff.bms v2.0 リリースのお知らせ',                       tag: 'RELEASE' },
  { date: '2026.09.12', title: '制作実績に ichiyanagi-clinic を追加しました',               tag: 'WORKS'   },
  { date: '2026.08.05', title: '「現場のデジタル化」についての対談イベントに登壇します',     tag: 'EVENT'   },
]

export default function NewsSection() {
  return (
    <section className="py-section-v-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex justify-between items-baseline mb-16">
        <div>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg uppercase leading-none">NEWS</h2>
          <p className="font-label-mono text-label-mono text-on-surface-variant mt-2 uppercase">最新情報</p>
        </div>
        <button className="hidden md:block font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant hover:text-accent-neon transition-colors">
          View All News →
        </button>
      </div>

      <div className="border-t border-outline-variant">
        {news.map((item) => (
          <div
            key={item.date}
            className="py-8 border-b border-outline-variant flex flex-col md:flex-row md:items-center gap-4 md:gap-16 group cursor-pointer"
          >
            <span className="font-label-mono text-label-mono text-on-surface-variant shrink-0">{item.date}</span>
            <h3 className="font-body-main text-[18px] flex-grow group-hover:text-accent-neon transition-colors">{item.title}</h3>
            <span className="w-fit font-label-mono text-[10px] border border-outline-variant px-2 text-on-surface-variant">{item.tag}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 md:hidden">
        <button className="w-full py-4 border border-outline-variant font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
          View All News →
        </button>
      </div>
    </section>
  )
}
