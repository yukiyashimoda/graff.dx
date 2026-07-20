import Link from 'next/link'
import TopNavBar from '../../../components/TopNavBar'

export const metadata = {
  title: 'CALC/RATE プライバシーポリシー — graff',
  description: 'CALC/RATE（カルクレート）のプライバシーポリシー。',
}

export default function CalcRatePrivacyPage() {
  return (
    <>
      <TopNavBar />
      <main className="min-h-screen bg-background pt-28 pb-32">
        <div className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 font-label-mono text-[11px] text-on-surface-variant hover:text-foreground uppercase tracking-widest transition-colors mb-12"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Works
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            CALC/RATE プライバシーポリシー
          </h1>
          <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-12">
            Last updated: 2026-07-20
          </p>

          <div className="space-y-10 text-on-surface-variant leading-[1.9] text-[15px]">
            <p>
              CALC/RATE（カルクレート、以下「本アプリ」）は、graff（以下「開発者」）が提供する電卓・為替換算アプリです。
              本アプリは利用者のプライバシーを尊重します。本ポリシーは、本アプリが扱う情報とその取り扱いを説明します。
            </p>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">取得・利用する情報</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <span className="text-foreground font-semibold">計算履歴</span>
                  ：計算式と結果を<span className="text-foreground">端末内のみに保存</span>し、履歴画面での再利用に使用します。開発者のサーバー等へは送信しません。
                </li>
                <li>
                  <span className="text-foreground font-semibold">アプリの設定</span>
                  ：小数点以下の桁数、丸め方、桁区切り、画面の常時点灯、起動画面、テーマ（ライト／ダーク）、効果音・触感フィードバックの有無、表示言語を
                  <span className="text-foreground">端末内のみに保存</span>します。
                </li>
                <li>
                  <span className="text-foreground font-semibold">個人を特定する情報</span>
                  ：氏名、メールアドレス、電話番号、位置情報、連絡先、端末の識別子などは
                  <span className="text-foreground">一切取得しません</span>。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">為替レートの取得について</h2>
              <p className="mb-4">
                為替換算機能では、最新のレートを取得するために外部の為替レート API
                （<span className="text-foreground">Frankfurter</span>）へ通信します。
              </p>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  送信するのは<span className="text-foreground">通貨コードのみ</span>です（例: 換算元 JPY、換算先 USD）。
                  入力した金額、計算履歴、その他の個人データは送信しません。
                </li>
                <li>
                  利用者を識別するアカウントや ID は持たないため、通信内容から個人を特定することはできません。
                </li>
                <li>
                  当該サービスにおける通信情報（IP アドレス等）の取り扱いは、提供元のポリシーに従います。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">第三者への提供・送信</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  開発者は、利用者の計算履歴・設定を<span className="text-foreground">収集しません</span>。これらは端末内に留まります。
                </li>
                <li>
                  本アプリは<span className="text-foreground">解析ツール・広告 SDK を一切組み込んでいません</span>。
                  利用状況の収集、クラッシュレポートの送信、広告の配信はいずれも行いません。
                </li>
                <li>開発者によるデータの販売・広告目的の利用は一切ありません。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">データの保存と削除</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>データは端末内に保存されます。</li>
                <li>計算履歴は、履歴画面の消去操作によりいつでも削除できます。</li>
                <li>アプリをアンインストールすると、保存されたすべてのデータが削除されます。</li>
                <li>
                  開発者側に利用者のデータは保管されていないため、開発者による削除対応はありません（端末側の操作で完結します）。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">権限</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>インターネット：為替レートの取得のため</li>
              </ul>
              <p className="mt-4">
                上記以外の権限（位置情報、カメラ、連絡先、ストレージ等）は要求しません。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">お子様の利用</h2>
              <p>本アプリは特定の年齢層を対象とした収集を行いません。個人データを開発者が収集しないため、児童の個人情報を意図的に取得することはありません。</p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">ポリシーの変更</h2>
              <p>本ポリシーは必要に応じて改定することがあります。重要な変更がある場合は、本ページ上で告知します。</p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">お問い合わせ</h2>
              <p>本ポリシーに関するお問い合わせは、開発者（graff）までご連絡ください。</p>
              <p className="mt-2">
                連絡先メール:{' '}
                <a href="mailto:graff-dx@icloud.com" className="text-accent-neon hover:underline">
                  graff-dx@icloud.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
