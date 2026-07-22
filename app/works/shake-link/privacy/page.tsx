import Link from 'next/link'
import TopNavBar from '../../../components/TopNavBar'

export const metadata = {
  title: 'SHAKE/LINK プライバシーポリシー — graff',
  description: 'SHAKE/LINK（シェイクリンク）のプライバシーポリシー。',
}

export default function ShakeLinkPrivacyPage() {
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
            SHAKE/LINK プライバシーポリシー
          </h1>
          <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-12">
            Last updated: 2026-07-20
          </p>

          <div className="space-y-10 text-on-surface-variant leading-[1.9] text-[15px]">
            <p>
              SHAKE/LINK（シェイクリンク、以下「本アプリ」）は、graff（以下「開発者」）が提供するリンク管理・QR 表示アプリです。
              本アプリは利用者のプライバシーを尊重します。本ポリシーは、本アプリが扱う情報とその取り扱いを説明します。
            </p>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">取得・利用する情報</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <span className="text-foreground font-semibold">登録したリンク</span>
                  ：利用者が登録した URL、そのラベル、サービスの種別、並び順を
                  <span className="text-foreground">端末内のみに保存</span>します。開発者のサーバー等へは送信しません。
                </li>
                <li>
                  <span className="text-foreground font-semibold">ウィジェットの表示設定</span>
                  ：ホーム画面ウィジェットに表示するリンクの選択状態、配色（カラーウェイ）を
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
              <p className="mb-4">
                本アプリ自身は<span className="text-foreground">インターネットに接続しません</span>。
                QR コードは登録された URL から<span className="text-foreground">端末内で生成</span>しており、
                その内容が外部へ送信されることはありません。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">リンクを開いたときの動作</h2>
              <p>
                登録したリンクをタップすると、端末が対応するアプリ（ブラウザや各サービスのアプリ）に URL を渡して開きます。
                その先での通信・データの取り扱いは、<span className="text-foreground">利用者が選んだアプリおよびリンク先のサービスのポリシーに従います</span>。
                開発者はその通信に関与せず、内容を把握することもできません。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">第三者への提供・送信</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  開発者は、利用者が登録したリンクや設定を<span className="text-foreground">収集しません</span>。これらは端末内に留まります。
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
                <li>登録したリンクは、アプリ内の削除操作によりいつでも取り除けます。</li>
                <li>アプリをアンインストールすると、保存されたすべてのデータが削除されます。</li>
                <li>
                  開発者側に利用者のデータは保管されていないため、開発者による削除対応はありません（端末側の操作で完結します）。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">権限</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>バイブレーション：操作時の触感フィードバックのため</li>
              </ul>
              <p className="mt-4">
                上記以外の権限（インターネット、位置情報、カメラ、連絡先、ストレージ等）は要求しません。
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
