import Link from 'next/link'
import TopNavBar from '../../../components/TopNavBar'

export const metadata = {
  title: 'CACHE/SNAP プライバシーポリシー — graff',
  description: 'CACHE/SNAP（キャッシュスナップ）のプライバシーポリシー。',
}

export default function CacheSnapPrivacyPage() {
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
            CACHE/SNAP プライバシーポリシー
          </h1>
          <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-12">
            Last updated: 2026-07-28
          </p>

          <div className="space-y-10 text-on-surface-variant leading-[1.9] text-[15px]">
            <p>
              CACHE/SNAP（キャッシュスナップ、以下「本アプリ」）は、graff（以下「開発者」）が提供する一時保存カメラアプリです。
              本アプリは利用者のプライバシーを尊重します。本ポリシーは、本アプリが扱う情報とその取り扱いを説明します。
            </p>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">取得・利用する情報</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <span className="text-foreground font-semibold">撮影した写真</span>
                  ：本アプリ内の一時保存領域に保存し、ギャラリー表示、閲覧、端末保存、削除のために使用します。開発者のサーバー等へは送信しません。
                </li>
                <li>
                  <span className="text-foreground font-semibold">アプリの設定</span>
                  ：保存期間、表示設定、撮影設定などを
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
              <h2 className="text-foreground text-xl font-bold mb-4">通信について</h2>
              <p>
                本アプリは、撮影した写真や設定を外部サーバーへ送信しません。
                解析ツール・広告 SDK・クラッシュレポート送信 SDK も組み込んでいません。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">データの保存と削除</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>撮影した写真は端末内に保存されます。</li>
                <li>設定した保存期間を過ぎた写真は、本アプリ内の一時保存領域から削除されます。</li>
                <li>お気に入りにした写真、または端末に保存した写真は、自動削除の対象外です。</li>
                <li>アプリをアンインストールすると、本アプリ内に保存されたデータは削除されます。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">権限</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>カメラ：写真撮影のため</li>
                <li>写真・メディアへの保存権限：撮影した写真を端末へ保存するため</li>
              </ul>
              <p className="mt-4">
                上記以外の権限（位置情報、連絡先等）は要求しません。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">第三者への提供・送信</h2>
              <p>
                開発者は、利用者の写真や設定を収集しません。したがって、第三者への提供、販売、広告目的の利用はありません。
              </p>
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
                <a href="mailto:graff_dx@icloud.com" className="text-accent-neon hover:underline">
                  graff_dx@icloud.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
