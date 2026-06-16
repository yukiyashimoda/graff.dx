import Link from 'next/link'
import TopNavBar from '../../components/TopNavBar'

export const metadata = {
  title: 'ワダチフイルム / wadachi film — graff',
  description:
    '記録ではなく、追憶を残す。歩いた道を一本の轍として残す、フィルムカメラ・散歩記録アプリ「ワダチフイルム」。',
  alternates: { canonical: 'https://graff-dx.dev/works/wadachi-film' },
  openGraph: {
    title: 'ワダチフイルム / wadachi film',
    description: '記録ではなく、追憶を残す。歩いた道を一本の轍として残す散歩記録アプリ。',
    url: 'https://graff-dx.dev/works/wadachi-film',
    images: ['https://graff-dx.dev/works/wadachi-film/cover.jpg'],
    type: 'website',
  },
}

export default function WadachiFilmWorkPage() {
  return (
    <>
      <TopNavBar />
      <main className="min-h-screen bg-background pt-28 pb-32">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 font-label-mono text-[11px] text-on-surface-variant hover:text-foreground uppercase tracking-widest transition-colors mb-12"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Works
          </Link>

          {/* Header */}
          <header className="max-w-3xl mb-14">
            <p className="font-label-mono text-[11px] text-accent-neon uppercase tracking-widest mb-6">
              App / Mobile · Android
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
              ワダチフイルム
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed">
              撮ることが、思い出になる。<br />
              記録ではなく、追憶を残す散歩記録アプリ。
            </p>
          </header>

          {/* Cover */}
          <div className="rounded-2xl overflow-hidden border border-outline-variant/40 mb-20">
            {/* 素材画像を public/works/wadachi-film/cover.jpg に配置 */}
            <img
              src="/works/wadachi-film/cover.jpg"
              alt="ワダチフイルム アプリの紹介ビジュアル"
              className="w-full h-auto block"
            />
          </div>

          {/* Manifesto */}
          <article className="max-w-2xl mx-auto text-on-surface-variant leading-[2] text-[15px] md:text-base space-y-7">
            <p>
              このアプリは便利な記録アプリでも、風景にフィルターをかけて上辺だけのノスタルジーに浸るためのアプリでもありません。
            </p>
            <p className="text-foreground font-semibold">
              写真機の本質に立ち返り、記録ではなく、追憶するためのアプリです。
            </p>
            <p>
              スマートフォンの進化によって、誰もが美しい写真を残せるようになりました。カメラの性能は向上し、高精細な写真を大量に撮れるようになりました。SNSでは簡単に作品を共有でき、写真技術の平均値も確実に上がっています。
            </p>
            <p className="text-foreground">それでも、振り返ることは減りました。</p>
            <p>
              撮ることが簡単になりすぎた結果、見返すことが置き去りになり、誰かに見せるための写真ばかりが増えていったように感じます。ワダチフイルムは、その逆を取り戻すために作ったアプリです。
            </p>
            <p>
              出かける前にフィルムをセットする。枚数は12枚、24枚、36枚。一本のフィルムを使い切るまで、撮影した写真は確認できません。<span className="text-foreground">不便なアプリです。</span>
            </p>
            <p>
              フィルムを使い切り、現像ボタンを押したとき。その日歩いた道が、地図の上に一本の軌跡として現れます。撮影した場所はピンとして表示されます。
            </p>
            <p>
              このアプリが大切にしているのは、撮影そのものではありません。撮影後の「現像」であり、歩き終えたあとに立ち上がる一本の轍です。ピンはレビューでも、おすすめスポットでも、誰かに評価されるための投稿でもありません。その瞬間、そこで心が動き、立ち止まったという痕跡です。
            </p>
            <p>
              ワダチフイルムは、写真を保存するアプリではありません。その日、その場所で感じた空気を、未来の自分へ手渡すためのアプリです。
            </p>
            <p>
              旅の途中では気づかなかったこと。何年も経ってから思い出すこと。もう会えなくなった人。もう無くなってしまった場所。それらを保存することはできません。
            </p>
            <p className="text-foreground">けれど、そこへ向かった道だけは残せる。</p>

            <div className="text-foreground text-lg md:text-xl font-semibold leading-[1.8] pt-4">
              <p>だからワダチフイルムは、</p>
              <p>目的地ではなく、轍を残す。</p>
              <p>写真ではなく、旅を残す。</p>
              <p>記録ではなく、追憶を残す。</p>
            </div>

            <p className="pt-2">ぜひ一度、触れてみてください。</p>
          </article>

          {/* CTA */}
          <div className="max-w-2xl mx-auto mt-16 flex flex-col sm:flex-row items-center gap-5">
            <span className="font-label-mono text-[12px] uppercase tracking-widest text-on-surface-variant border border-outline-variant/60 rounded-full px-5 py-2.5">
              Google Play · 近日公開
            </span>
            <Link
              href="/works/wadachi-film/privacy"
              className="font-label-mono text-[12px] uppercase tracking-widest text-accent-neon hover:underline"
            >
              プライバシーポリシー →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
