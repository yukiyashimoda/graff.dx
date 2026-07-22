import Link from 'next/link'
import TopNavBar from '../../../components/TopNavBar'

export const metadata = {
  title: 'ワダチフイルム プライバシーポリシー — graff',
  description: 'wadachi film（ワダチフイルム）のプライバシーポリシー。',
}

export default function WadachiPrivacyPage() {
  return (
    <>
      <TopNavBar />
      <main className="min-h-screen bg-background pt-28 pb-32">
        <div className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto">
          <Link
            href="/works/wadachi-film"
            className="inline-flex items-center gap-2 font-label-mono text-[11px] text-on-surface-variant hover:text-foreground uppercase tracking-widest transition-colors mb-12"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            ワダチフイルム
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            ワダチフイルム プライバシーポリシー
          </h1>
          <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-12">
            Last updated: 2026-06-16
          </p>

          <div className="space-y-10 text-on-surface-variant leading-[1.9] text-[15px]">
            <p>
              wadachi film（ワダチフイルム、以下「本アプリ」）は、graff（以下「開発者」）が提供する個人向けの写真・散歩記録アプリです。
              本アプリは利用者のプライバシーを尊重します。本ポリシーは、本アプリが扱う情報とその取り扱いを説明します。
            </p>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">取得・利用する情報</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <span className="text-foreground font-semibold">位置情報（精密／おおよそ）</span>
                  ：撮影中（フィルムを入れている間）のみ、歩いた経路と撮影地点を記録するために取得します。取得した位置情報は
                  <span className="text-foreground">端末内のみに保存</span>され、現像時の地図表示に使用します。開発者のサーバー等へは送信しません。バックグラウンド位置情報は取得しません（アプリ使用中のフォアグラウンドのみ）。
                </li>
                <li>
                  <span className="text-foreground font-semibold">カメラ・写真</span>
                  ：撮影した写真は<span className="text-foreground">端末内のアプリ領域に保存</span>されます。開発者のサーバー等へは送信しません。「端末に保存」操作を行った場合のみ、利用者の明示的な操作により端末のギャラリーへコピーします。
                </li>
                <li>
                  <span className="text-foreground font-semibold">コメント等の入力テキスト</span>
                  ：写真に付けたコメント、フィルムの題名は端末内のみに保存します。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">共有・取り込み機能について</h2>
              <p className="mb-4">
                本アプリには、利用者が<span className="text-foreground">自分の操作で選んだときだけ</span>フィルムを他者・他アプリに共有する機能があります。利用者が共有しない限り、これらのデータが外部に渡ることはありません。
              </p>
              <ul className="list-disc pl-5 space-y-3">
                <li><span className="text-foreground font-semibold">画像で共有</span>：地図と写真を1枚の画像に合成して、利用者が選んだアプリへ送ります。正確な座標は埋め込まれません。</li>
                <li><span className="text-foreground font-semibold">データで共有（zip）</span>：フィルム1巻分（写真・コメント・経路・撮影地点の座標）をまとめたファイルを書き出し、利用者が選んだ相手・アプリへ送ります。送信先は利用者が選択します。</li>
                <li><span className="text-foreground font-semibold">取り込み</span>：他者から受け取ったファイルを利用者が開いた場合、その内容を端末内に取り込みます。</li>
              </ul>
              <p className="mt-4">
                共有された情報の取り扱いは、利用者が送信先として選んだサービス・相手に依存します。位置情報を含む「データで共有」を行う際は、送信先にご注意ください。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">第三者への提供・送信</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>開発者は、利用者の個人データ（位置情報・写真・コメント）を<span className="text-foreground">収集しません</span>。これらは端末内に留まり、上記の利用者自身による共有を除き、外部へ送信されません。</li>
                <li>開発者によるデータの販売・広告目的の利用は一切ありません。</li>
                <li>地図表示のため、地図タイル配信元（OpenFreeMap / OpenStreetMap）へ表示範囲の地図データを取得するリクエストを行います。この通信に個人を特定する情報は含めません。第三者サービスの取り扱いは各提供元のポリシーに従います。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">データの保存と削除</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>データは端末内に保存されます。アプリ内の「フィルムを捨てる」操作、またはアプリのアンインストールにより削除されます。</li>
                <li>開発者側に利用者のデータは保管されていないため、開発者による削除対応はありません（端末側の操作で完結します）。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">権限</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>カメラ：写真撮影のため</li>
                <li>位置情報（精密／おおよそ）：経路・撮影地点の記録のため（使用中のみ）</li>
                <li>フォアグラウンドサービス（位置情報）：撮影中の経路記録を継続するため</li>
                <li>通知：撮影中であることの表示のため</li>
                <li>インターネット：地図タイルの取得・共有時のファイル受け渡しのため</li>
              </ul>
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
