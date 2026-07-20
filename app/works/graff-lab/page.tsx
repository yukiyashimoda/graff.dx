import Link from 'next/link'
import TopNavBar from '../../components/TopNavBar'

export const metadata = {
  title: 'GRAFF.LAB — アプリシリーズとテスター募集 — graff',
  description:
    '実在する道具のような手触りを目指した Android アプリシリーズ GRAFF.LAB。公開前のクローズドテストに参加いただける方を募集しています。',
  alternates: { canonical: 'https://graff-dx.dev/works/graff-lab' },
  openGraph: {
    title: 'GRAFF.LAB — アプリシリーズとテスター募集',
    description:
      '実在する道具のような手触りを目指した Android アプリシリーズ。クローズドテスト参加者を募集中。',
    url: 'https://graff-dx.dev/works/graff-lab',
    type: 'website',
  },
}

// ───────────────────────────────────────────────────────────
// 公開前に埋める値。Play Console でクローズドテストを作成すると
// オプトイン URL が発行されるので、ここに貼るだけでページ全体に反映される。
// ───────────────────────────────────────────────────────────

/** テスター用 Google グループ。参加申請するとテスターとして登録される。 */
const TESTER_GROUP_URL = 'https://groups.google.com/g/graff-lab-testers' // TODO: 作成後に確定URLへ

/** 問い合わせ先。グループが使えない人向けの受け口。 */
const CONTACT_MAIL = 'graff-dx@icloud.com'

type App = {
  slug: string
  name: string
  reading: string
  tagline: string
  description: string
  points: string[]
  image: string
  /** Play Console のクローズドテスト オプトイン URL。未発行のうちは null。 */
  optInUrl: string | null
}

const APPS: App[] = [
  {
    slug: 'calc-rate',
    name: 'CALC/RATE',
    reading: 'カルクレート',
    tagline: '押した手応えのある電卓と、為替換算。',
    description:
      '7セグメント表示とシリコンキーの手触りにこだわった電卓。横スワイプで為替換算に切り替わり、最新レートで計算できます。',
    points: ['電卓 ⇄ 為替換算の2画面', '12通貨に対応', '計算履歴・多言語（日英韓中西）'],
    image: '/works/graff-lab/calc-rate.png',
    optInUrl: null, // TODO
  },
  {
    slug: 'shake-link',
    name: 'SHAKE/LINK',
    reading: 'シェイクリンク',
    tagline: 'よく使うリンクを、手のひらのガジェットに。',
    description:
      'SNS やよく開くページを液晶パネル付きの筐体に並べるリンク管理。QR 表示で相手にすぐ渡せます。ホーム画面ウィジェット対応。',
    points: ['51種のサービスアイコン', 'QRコードを端末内で生成', '筐体カラー6色・ウィジェット対応'],
    image: '/works/graff-lab/shake-link.png',
    optInUrl: null, // TODO
  },
  {
    slug: 'moonphasetime',
    name: 'MoonPhaseTime',
    reading: 'ムーンフェイズタイム',
    tagline: '月の満ち欠けを、ホーム画面に。',
    description:
      '月齢と時刻を金属筐体のガジェット風に表示するウィジェット。今夜の月がどんな形かひと目で分かります。',
    points: ['ホーム画面ウィジェット', '月齢を端末内で計算', '権限・通信なし'],
    image: '/works/graff-lab/moonphasetime.png',
    optInUrl: null, // TODO
  },
]

export default function GraffLabPage() {
  return (
    <>
      <TopNavBar />
      {/* アプリのダークテーマと同じ地色。ここから内側がニューモーフィズムの世界。 */}
      <main className="neu-scope min-h-screen pt-28 pb-32">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 font-label-mono text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity mb-12"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Works
          </Link>

          {/* ── Hero ── */}
          <header className="max-w-3xl mb-20">
            <p className="font-label-mono text-[11px] text-accent-neon uppercase tracking-widest mb-6">
              App Series · Android
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">GRAFF.LAB</h1>
            <p className="text-lg md:text-xl leading-relaxed opacity-80 mb-8">
              画面の中のボタンに、押した手応えを。
              <br />
              実在する道具のような質感を目指した Android アプリシリーズです。
            </p>
            <p className="leading-[1.9] text-[15px] opacity-70">
              現在3つのアプリを公開準備中です。ストア公開の前に、実際に使っていただける
              テスターを募集しています。
            </p>
          </header>

          {/* ── テスター募集（凸パネル） ── */}
          <section id="testing" className="neu-raised rounded-[28px] p-8 md:p-12 mb-24">
            <p className="font-label-mono text-[11px] text-accent-neon uppercase tracking-widest mb-5">
              Recruiting Testers
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-5">
              テスターを募集しています
            </h2>
            <p className="leading-[1.9] text-[15px] opacity-75 mb-10 max-w-2xl">
              Google Play のルールにより、アプリを一般公開するには公開前に一定期間のテストが
              必要です。ご協力いただける方は、以下の3ステップでご参加ください。
              <span className="opacity-100 font-bold">費用は一切かかりません。</span>
            </p>

            <ol className="space-y-8 mb-12">
              <Step
                n={1}
                title="テスターグループに参加する"
                body={
                  <>
                    下のボタンから Google グループに参加してください。参加に使った Google
                    アカウントが、そのままテスターとして登録されます。
                    <br />
                    <span className="opacity-60 text-[13px]">
                      ※ Android 端末で普段お使いの Google アカウントでご参加ください。
                    </span>
                  </>
                }
              />
              <Step
                n={2}
                title="アプリをインストールする"
                body={
                  <>
                    グループ参加後、下のアプリ一覧にある「テストに参加」から Google Play を開き、
                    インストールしてください。
                    <br />
                    <span className="opacity-60 text-[13px]">
                      ※ 参加直後は反映まで数分〜数時間かかることがあります。
                    </span>
                  </>
                }
              />
              <Step
                n={3}
                title="14日間、ときどき使う"
                body={
                  <>
                    テスト期間中はアプリを削除せず、ときどき起動して使ってみてください。
                    使いにくい点や不具合に気づいたら、
                    <a href={`mailto:${CONTACT_MAIL}`} className="text-accent-neon hover:underline">
                      {CONTACT_MAIL}
                    </a>
                    までお知らせいただけると助かります。
                  </>
                }
              />
            </ol>

            {/* 主 CTA = アプリのキーと同じ凸ボタン。押すと凹む。 */}
            <a
              href={TESTER_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="neu-raised-sm neu-key neu-press-on-active rounded-[22px] inline-flex items-center gap-3
                         px-10 py-5 font-bold text-accent-neon transition-shadow"
            >
              テスターグループに参加する
              <span className="material-symbols-outlined text-lg">open_in_new</span>
            </a>

            <p className="text-[13px] opacity-55 mt-6">
              グループへの参加が難しい場合は、お使いの Google アカウントのメールアドレスを{' '}
              <a href={`mailto:${CONTACT_MAIL}`} className="text-accent-neon hover:underline">
                {CONTACT_MAIL}
              </a>{' '}
              までお送りください。こちらで登録します。
            </p>
          </section>

          {/* ── アプリ一覧 ── */}
          <section>
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">アプリ</h2>
              <span className="font-label-mono text-[11px] opacity-35">
                {String(APPS.length).padStart(2, '0')} APPS
              </span>
            </div>

            <div className="space-y-10">
              {APPS.map((app) => (
                <AppCard key={app.slug} app={app} />
              ))}
            </div>
          </section>

          {/* ── よくある質問（凹パネル） ── */}
          <section className="mt-28">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-10">よくある質問</h2>
            <div className="neu-pressed rounded-[28px] p-8 md:p-12 space-y-8 leading-[1.9] text-[15px] max-w-3xl">
              <Faq q="お金はかかりますか？">
                テスト期間中は無料です。課金や自動更新は一切ありません。
              </Faq>
              <Faq q="個人情報は収集されますか？">
                いずれのアプリも、氏名・メールアドレス・位置情報などの個人データを収集しません。
                解析ツールや広告も入っていません。詳細は各アプリのプライバシーポリシーをご覧ください。
              </Faq>
              <Faq q="途中でやめられますか？">
                いつでもアンインストールしていただけます。ただし公開までの期間、テスターの人数が
                一定数必要なため、可能であれば期間中は残していただけると助かります。
              </Faq>
              <Faq q="iPhone でも使えますか？">現在は Android のみの提供です。</Faq>
              <Faq q="感想はどこに送ればいいですか？">
                <a href={`mailto:${CONTACT_MAIL}`} className="text-accent-neon hover:underline">
                  {CONTACT_MAIL}
                </a>{' '}
                までお気軽にお送りください。良かった点も、使いにくかった点も歓迎します。
              </Faq>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

function Step({ n, title, body }: { n: number; title: string; body: React.ReactNode }) {
  return (
    <li className="flex gap-5">
      {/* 番号は凹み＝盤面に刻まれた印字のイメージ */}
      <span className="neu-pressed shrink-0 w-10 h-10 rounded-full text-accent-neon font-label-mono text-sm flex items-center justify-center">
        {n}
      </span>
      <div className="pt-1.5">
        <h3 className="font-bold mb-2">{title}</h3>
        <p className="leading-[1.9] text-[15px] opacity-75">{body}</p>
      </div>
    </li>
  )
}

function AppCard({ app }: { app: App }) {
  return (
    <article className="neu-raised rounded-[28px] p-7 md:p-10 grid md:grid-cols-[180px_1fr] gap-8 md:gap-12 items-start">
      {/* アイコンは凹んだ窓にはめ込む */}
      <div className="neu-pressed w-[130px] md:w-full aspect-square rounded-[24px] p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={app.image}
          alt={`${app.name} のアイコン`}
          className="w-full h-full object-cover rounded-[16px]"
        />
      </div>

      <div>
        <p className="font-label-mono text-[11px] opacity-50 uppercase tracking-widest mb-2">
          {app.reading}
        </p>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">{app.name}</h3>
        <p className="text-lg mb-4">{app.tagline}</p>
        <p className="leading-[1.9] text-[15px] opacity-70 mb-6 max-w-2xl">{app.description}</p>

        <ul className="flex flex-wrap gap-2.5 mb-8">
          {app.points.map((p) => (
            <li
              key={p}
              className="neu-raised-sm rounded-full font-label-mono text-[11px] px-4 py-2 opacity-80"
            >
              {p}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-5">
          {app.optInUrl ? (
            <a
              href={app.optInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="neu-raised-sm neu-key neu-press-on-active rounded-[22px] inline-flex items-center gap-2
                         px-7 py-3.5 font-bold text-accent-neon transition-shadow"
            >
              テストに参加
              <span className="material-symbols-outlined text-base">open_in_new</span>
            </a>
          ) : (
            <span className="neu-pressed rounded-[22px] inline-flex items-center px-7 py-3.5 font-label-mono text-[12px] uppercase tracking-widest opacity-45">
              準備中
            </span>
          )}

          <Link
            href={`/works/${app.slug}/privacy`}
            className="font-label-mono text-[11px] uppercase tracking-widest opacity-55 hover:opacity-100 transition-opacity"
          >
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </article>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold mb-2">{q}</h3>
      <p className="opacity-75">{children}</p>
    </div>
  )
}
