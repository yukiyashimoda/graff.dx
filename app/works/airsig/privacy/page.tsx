import Link from 'next/link'
import TopNavBar from '../../../components/TopNavBar'

export const metadata = {
  title: 'AIR/SIG プライバシーポリシー — graff',
  description: 'AIR/SIG（エアシグ）のプライバシーポリシー。',
}

export default function AirsigPrivacyPage() {
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
            AIR/SIG プライバシーポリシー
          </h1>
          <p className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-12">
            Last updated: 2026-09-24
          </p>

          <div className="space-y-10 text-on-surface-variant leading-[1.9] text-[15px]">
            <p>
              AIR/SIG（エアシグ、以下「本アプリ」）は、graff（以下「開発者」）が提供する、つながっている相手の様子をゆるく伝え合うアプリです。
              本アプリは、相手の居場所や正確な状況を伝えません。本ポリシーは、本アプリが扱う情報とその取り扱いを説明します。
            </p>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">相手に伝わる情報</h2>
              <p className="mb-4">つながっている相手には、次の情報だけが伝わります。</p>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <span className="text-foreground font-semibold">いまの様子</span>
                  ：「起きてる」「移動してる」「歩いてる」「放置中」「寝てる」「反応なし」のいずれか。
                  時間の経過で様子がどう変わるかの予定と、最後にスマホが使われた時刻を含みます。
                </li>
                <li>
                  <span className="text-foreground font-semibold">表示名</span>
                  ：利用者がアプリに入力した名前。
                </li>
              </ul>
              <p className="mt-4">
                これらは Apple の iCloud（CloudKit）を通じて、利用者が承認した相手にだけ届きます。
                相手ごとに推測できないランダムな鍵で分けて保管され、その鍵を持つ相手以外は読み取れません。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">端末の中だけで使う情報</h2>
              <p className="mb-4">様子を判定するために次の情報を使いますが、<span className="text-foreground">相手に共有したり、外部に送信したりすることはありません</span>。</p>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <span className="text-foreground font-semibold">モーション（動き）</span>
                  ：歩いている・乗り物に乗っているといった判定と、ふだん休んでいる時間帯の推定に使います。
                </li>
                <li>
                  <span className="text-foreground font-semibold">大まかな位置情報</span>
                  ：運転中や、電車・バスなどの公共交通機関に乗っているかを判定するためだけに使います。
                  iOS の「おおよその位置」のみを使い、正確な位置は取得しません。移動の判定のため、直前の大まかな位置を端末内に保存します。
                </li>
                <li>
                  <span className="text-foreground font-semibold">スマホを使った時刻の記録</span>
                  ：休んでいる時間帯を学習するため、アプリが確認した利用や移動の時刻を最長30日分、端末内に保存します。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">取得しない情報</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>正確な位置や、移動した経路</li>
                <li>どのアプリを使っているか、何を見ているか</li>
                <li>メッセージや通話の内容、連絡先</li>
                <li>メールアドレス、電話番号など、表示名以外の個人を特定する情報</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">つながり方</h2>
              <p>
                招待リンクまたは QR コードを相手に渡し、お互いが承認したときだけつながります。
                招待には、作成した人の表示名と、ランダムな鍵が含まれます。招待は iCloud 上に最長24時間保管され、使われるか期限が切れると削除されます。
                一方的に相手の様子を見ることはできません。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">第三者への提供・送信</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  開発者は独自のサーバーを持ちません。データの受け渡しには Apple の iCloud（CloudKit）のみを使います。
                </li>
                <li>
                  開発者は、iCloud 上の情報を閲覧・分析・利用しません。販売や広告目的での利用も一切ありません。
                </li>
                <li>
                  本アプリは<span className="text-foreground">解析ツール・広告 SDK を一切組み込んでいません</span>。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">データの削除</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  相手とのつながりを解除すると、その相手に向けて iCloud 上に置かれていた様子の情報が削除されます。
                  相手の端末からも、次に確認したときにつながりが外れます。
                </li>
                <li>
                  アプリを削除すると、端末内の記録（動きや時刻の記録、大まかな位置を含む）はすべて削除されます。
                  iCloud 上の情報も消したい場合は、アプリを削除する前につながりを解除してください。
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">権限</h2>
              <ul className="list-disc pl-5 space-y-3">
                <li>モーションとフィットネス：歩いている・乗り物に乗っている判定と、休んでいる時間帯の推定のため</li>
                <li>位置情報（おおよその位置・常に許可）：運転中や公共交通機関に乗っているかの判定のためだけ。アプリを開いていない間の移動も判定するため「常に」を求めます</li>
                <li>iCloud：つながっている相手と様子を受け渡すため</li>
              </ul>
              <p className="mt-4">
                どの権限も許可しない場合、その判定が行われないだけで、アプリは利用できます。許可は iOS の設定アプリからいつでも変更できます。
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-xl font-bold mb-4">お子様の利用</h2>
              <p>本アプリは特定の年齢層を対象とした収集を行いません。</p>
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
