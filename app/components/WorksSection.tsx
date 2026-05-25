const works = [
  { num: '01', title: 'graff.bms',         tag: 'PRODUCT',     accent: true,  desc: 'Bar Management System (OSS for restaurants)' },
  { num: '02', title: 'ichiyanagi-clinic', tag: 'CLIENT WORK', accent: false, desc: '内科消化器科クリニック' },
  { num: '03', title: 'Trioki',            tag: 'PRODUCT',     accent: true,  desc: 'LINE Mini App (Reservation system)' },
  { num: '04', title: 'Avis',              tag: 'PRODUCT',     accent: true,  desc: 'Data analysis platform' },
]

export default function WorksSection() {
  return (
    <section className="py-section-v-padding px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="mb-24">
        <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg uppercase mb-4">WORKS</h2>
        <p className="font-subtext-jp text-subtext-jp text-on-surface-variant">現場と現場のあいだに、橋をかける。</p>
        <p className="mt-8 font-body-main text-body-main text-on-surface-variant max-w-lg">
          複数のプロダクト開発とクライアントワークを通じて、現場の課題を可視化します。
        </p>
      </div>

      <div className="border-t border-outline-variant">
        {works.map((w) => (
          <div
            key={w.num}
            className="group relative border-b border-outline-variant py-12 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer transition-colors hover:bg-surface-container-lowest px-0 hover:px-6 duration-300"
          >
            <div className="flex items-center gap-8 md:gap-16">
              <span className="font-label-mono text-[32px] md:text-headline-md opacity-20 group-hover:opacity-100 transition-opacity">
                {w.num}
              </span>
              <div>
                <h3 className="font-headline-md text-[24px] md:text-[40px] uppercase">{w.title}</h3>
                {w.accent
                  ? <span className="font-label-mono text-[10px] border border-accent-neon px-2 text-accent-neon">{w.tag}</span>
                  : <span className="font-label-mono text-[10px] border border-on-surface-variant px-2 text-on-surface-variant">{w.tag}</span>
                }
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 md:mt-0 md:max-w-xs">{w.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 text-right">
        <button className="font-label-mono text-label-mono uppercase tracking-widest text-on-surface-variant hover:text-accent-neon transition-colors">
          View All Works →
        </button>
      </div>
    </section>
  )
}
