import Link from 'next/link'
import TopNavBar from '../components/TopNavBar'
import ScrollReveal from '../components/ScrollReveal'
import { initSchema, getPublishedWorks } from '../lib/db'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Works — graff' }

export default async function WorksPage() {
  await initSchema()
  const works = await getPublishedWorks()

  return (
    <>
      <TopNavBar />
      <main className="min-h-screen bg-background pt-28 pb-32 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">

          <div className="flex items-end justify-between mb-16 border-b border-outline-variant pb-8">
            <div>
              <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.3em] block mb-4">
                003 — Works
              </span>
              <h1
                className="text-[15vw] md:text-[9vw] font-bold uppercase leading-none tracking-tight"
                style={{ fontFamily: 'var(--ff-share-tech)' }}
              >
                WORKS
              </h1>
            </div>
            <span className="font-label-mono text-label-mono text-on-surface-variant/40 mb-2">
              {/* DB由来 + 固定カード2枚（GRAFF.LAB / wadachi film） */}
              {String(works.length + 2).padStart(2, '0')} PROJECTS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant">
            {/* GRAFF.LAB（アプリシリーズ／テスター募集 LP への固定カード） */}
            <ScrollReveal delay={0}>
              <Link
                href="/works/graff-lab"
                className="group block bg-background hover:bg-surface-container-low transition-colors duration-300"
              >
                <div className="relative aspect-video overflow-hidden bg-surface-container flex items-center justify-center gap-4 p-8">
                  {['calc-rate', 'shake-link', 'moonphasetime'].map((s) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={s}
                      src={`/works/graff-lab/${s}.png`}
                      alt=""
                      className="w-1/4 aspect-square object-cover rounded-xl transition-all duration-700
                                 grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105"
                    />
                  ))}
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-label-mono text-[10px] border px-2 py-0.5 uppercase tracking-widest border-accent-neon text-accent-neon">
                      APP SERIES
                    </span>
                    <span className="font-label-mono text-[10px] text-on-surface-variant/40">2026</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 group-hover:text-accent-neon transition-colors duration-300">
                    GRAFF.LAB
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 line-clamp-2">
                    押した手応えのある道具を目指した Android アプリシリーズ。公開前のテスターを募集中。
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Kotlin', 'Compose', 'Design System', 'Widget'].map((t) => (
                      <span key={t} className="font-label-mono text-[10px] text-on-surface-variant/60 border border-outline-variant px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 font-label-mono text-[11px] text-accent-neon uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>View case</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>

            {/* wadachi film（静的ページ /works/wadachi-film への固定カード） */}
            <ScrollReveal delay={0.08}>
              <Link
                href="/works/wadachi-film"
                className="group block bg-background hover:bg-surface-container-low transition-colors duration-300"
              >
                <div className="relative aspect-video overflow-hidden bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/works/wadachi-film/cover.jpg"
                    alt="ワダチフイルム"
                    className="w-full h-full object-cover transition-all duration-700
                               grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 pointer-events-none transition-opacity duration-700
                                  bg-background/30 mix-blend-multiply opacity-100 group-hover:opacity-0" />
                  <div className="absolute inset-0 pointer-events-none transition-opacity duration-700
                                  bg-accent-neon/8 opacity-100 group-hover:opacity-0" />
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-label-mono text-[10px] border px-2 py-0.5 uppercase tracking-widest border-accent-neon text-accent-neon">
                      PRODUCT
                    </span>
                    <span className="font-label-mono text-[10px] text-on-surface-variant/40">2026</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 group-hover:text-accent-neon transition-colors duration-300">
                    ワダチフイルム
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 line-clamp-2">
                    記録ではなく、追憶を残す。歩いた道を一本の轍として残す散歩記録アプリ。
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Kotlin', 'Compose', 'MapLibre', 'Room'].map((t) => (
                      <span key={t} className="font-label-mono text-[10px] text-on-surface-variant/60 border border-outline-variant px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 font-label-mono text-[11px] text-accent-neon uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>View case</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
                <div className="h-px w-0 bg-accent-neon group-hover:w-full transition-all duration-700 ease-out" />
              </Link>
            </ScrollReveal>

            {works.map((work, i) => (
              <ScrollReveal key={work.slug} delay={i * 0.08}>
                <Link
                  href={`/works/${work.slug}`}
                  className="group block bg-background hover:bg-surface-container-low transition-colors duration-300"
                >
                  <div className="relative aspect-video overflow-hidden bg-surface-container">
                    {work.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={work.images[0]}
                        alt={work.title}
                        className="w-full h-full object-cover transition-all duration-700
                                   grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center select-none">
                        <span
                          className="font-bold leading-none text-on-surface-variant/10"
                          style={{ fontSize: 'clamp(80px, 12vw, 160px)', fontFamily: 'var(--ff-share-tech)' }}
                        >
                          {work.num || String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-700
                                    bg-background/30 mix-blend-multiply opacity-100 group-hover:opacity-0" />
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-700
                                    bg-accent-neon/8 opacity-100 group-hover:opacity-0" />
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`font-label-mono text-[10px] border px-2 py-0.5 uppercase tracking-widest ${
                        work.tag === 'PRODUCT'
                          ? 'border-accent-neon text-accent-neon'
                          : 'border-on-surface-variant text-on-surface-variant'
                      }`}>
                        {work.tag}
                      </span>
                      <span className="font-label-mono text-[10px] text-on-surface-variant/40">{work.year || ''}</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-3 group-hover:text-accent-neon transition-colors duration-300">
                      {work.title}
                    </h2>

                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 line-clamp-2">
                      {work.short_desc}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {work.tech_stack.slice(0, 4).map((tech) => (
                        <span key={tech} className="font-label-mono text-[10px] text-on-surface-variant/60 border border-outline-variant px-2 py-0.5">
                          {tech}
                        </span>
                      ))}
                      {work.tech_stack.length > 4 && (
                        <span className="font-label-mono text-[10px] text-on-surface-variant/40 px-2 py-0.5">
                          +{work.tech_stack.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-label-mono text-[11px] text-accent-neon uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>View case</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>

                  <div className="h-px w-0 bg-accent-neon group-hover:w-full transition-all duration-700 ease-out" />
                </Link>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </main>
    </>
  )
}
