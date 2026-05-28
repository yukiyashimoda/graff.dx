import Link from 'next/link'
import { notFound } from 'next/navigation'
import TopNavBar from '../../components/TopNavBar'
import { works, getWork } from '../../data/works'

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) return {}
  return { title: `${work.title} — graff` }
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = getWork(slug)
  if (!work) notFound()

  const currentIndex = works.findIndex((w) => w.slug === slug)
  const prev = works[currentIndex - 1] ?? null
  const next = works[currentIndex + 1] ?? null

  return (
    <>
      <TopNavBar />
      <main className="min-h-screen bg-background pt-28 pb-32">

        {/* ─── ヘッダー ─── */}
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 font-label-mono text-[11px] text-on-surface-variant hover:text-foreground uppercase tracking-widest transition-colors mb-12"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Works
          </Link>

          <div className="mb-12">
            <span
              className={`inline-block font-label-mono text-[10px] border px-2 py-0.5 uppercase tracking-widest mb-6 ${
                work.tag === 'PRODUCT'
                  ? 'border-accent-neon text-accent-neon'
                  : 'border-on-surface-variant text-on-surface-variant'
              }`}
            >
              {work.tag}
            </span>
            <h1
              className="text-[14vw] md:text-[8vw] font-bold uppercase leading-none tracking-tight mb-8"
              style={{ fontFamily: 'var(--ff-share-tech)' }}
            >
              {work.title}
            </h1>

            {/* メタデータ行 */}
            <div className="flex flex-wrap gap-x-12 gap-y-4 border-t border-outline-variant pt-6">
              <div>
                <p className="font-label-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">Year</p>
                <p className="font-label-mono text-label-mono">{work.year}</p>
              </div>
              <div>
                <p className="font-label-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">Role</p>
                <p className="font-label-mono text-label-mono">{work.role.join(' / ')}</p>
              </div>
              {work.url && (
                <div>
                  <p className="font-label-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">Live</p>
                  <a
                    href={work.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-label-mono text-label-mono text-accent-neon hover:underline"
                  >
                    View site ↗
                  </a>
                </div>
              )}
              {work.github && (
                <div>
                  <p className="font-label-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-1">GitHub</p>
                  <a
                    href={work.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-label-mono text-label-mono text-accent-neon hover:underline"
                  >
                    Repository ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── ヒーロー画像 ─── */}
        <div className="w-full aspect-video md:aspect-[21/9] bg-surface-container mb-16 overflow-hidden">
          {work.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={work.images[0]} alt={work.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center select-none">
              <span
                className="font-bold leading-none text-on-surface-variant/[0.06]"
                style={{ fontSize: 'clamp(120px, 20vw, 280px)', fontFamily: 'var(--ff-share-tech)' }}
              >
                {work.num}
              </span>
            </div>
          )}
        </div>

        {/* ─── 本文 ─── */}
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-16 mb-20">

            {/* 左：説明文 */}
            <div>
              <h2 className="font-label-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-4">
                Overview
              </h2>
              <p className="text-body-main text-on-surface leading-loose">{work.longDesc}</p>
            </div>

            {/* 右：テックスタック */}
            <div>
              <h2 className="font-label-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest mb-4">
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {work.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="font-label-mono text-[11px] text-on-surface border border-outline-variant px-3 py-1.5 hover:border-accent-neon hover:text-accent-neon transition-colors duration-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ─── 追加スクリーンショット ─── */}
          {work.images.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
              {work.images.slice(1).map((src, i) => (
                <div key={i} className="aspect-video bg-surface-container overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${work.title} screenshot ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* ─── Prev / Next ─── */}
          <div className="border-t border-outline-variant pt-10 grid grid-cols-2 gap-4">
            <div>
              {prev && (
                <Link
                  href={`/works/${prev.slug}`}
                  className="group inline-flex flex-col gap-2"
                >
                  <span className="font-label-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Prev
                  </span>
                  <span className="font-bold uppercase text-lg group-hover:text-accent-neon transition-colors">
                    {prev.title}
                  </span>
                </Link>
              )}
            </div>
            <div className="text-right">
              {next && (
                <Link
                  href={`/works/${next.slug}`}
                  className="group inline-flex flex-col gap-2 items-end"
                >
                  <span className="font-label-mono text-[10px] text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-1">
                    Next
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                  <span className="font-bold uppercase text-lg group-hover:text-accent-neon transition-colors">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
