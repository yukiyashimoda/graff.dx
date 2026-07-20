import Link from 'next/link'
import TopNavBar from '../../../components/TopNavBar'

export const metadata = {
  title: 'MoonPhaseTime プライバシーポリシー — graff',
  description: 'MoonPhaseTime（ムーンフェイズタイム）のプライバシーポリシー。',
}

export default function MoonPhaseTimePrivacyPage() {
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
            MoonPhaseTime プライバシーポリシー
          </h1>
          <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-12">
            Last updated: 2026-07-20
          </p>

          <div className="space-y-10 text-on-surface-variant leading-[1.9] text-[15px]">
            <p>
              MoonPhaseTime（ムーンフェイズタイム、以下「本アプリ」）は、graff（以下「開発者」）が提供する月齢・時刻表示ウィジェットアプリです。
              本アプリは利用者のプライバシーを尊重します。本ポリシーは、本アプリが扱う情報とその取り扱いを説明します。
            </p>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">取得・利用する情報</h2>
              <p className="mb-4">
                本アプリは<span className="text-foreground">利用者の情報を一切取得しません</span>。
              </p>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  月齢と時刻の表示には、<span className="text-foreground">端末の日付・時刻のみ</span>を参照します。
                  参照した日時はその場の表示に使うだけで、保存も送信もしません。
                </li>
                <li>
                  月齢は端末内の計算のみで求めています。位置情報は使用しません。
                </li>
                <li>
                  氏名、メールアドレス、電話番号、位置情報、連絡先、端末の識別子などは
                  <span className="text-foreground">一切取得しません</span>。
                </li>
                <li>アプリの設定を含め、端末内に保存するデータはありません。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">通信について</h2>
              <p>
                本アプリは<span className="text-foreground">インターネットに接続しません</span>。
                表示内容はすべて端末内で生成され、外部へデータを送信することはありません。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">第三者への提供・送信</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>開発者が収集するデータが存在しないため、第三者へ提供するデータもありません。</li>
                <li>
                  本アプリは<span className="text-foreground">解析ツール・広告 SDK を一切組み込んでいません</span>。
                  利用状況の収集、クラッシュレポートの送信、広告の配信はいずれも行いません。
                </li>
                <li>開発者によるデータの販売・広告目的の利用は一切ありません。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">データの保存と削除</h2>
              <p>
                本アプリは利用者のデータを保存しません。アプリおよびウィジェットを削除すれば、それ以上の対応は不要です。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">権限</h2>
              <p>
                本アプリは<span className="text-foreground">端末の権限を一切要求しません</span>。
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
