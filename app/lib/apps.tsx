export type App = {
  slug: string
  name: string
  reading: string
  tagline: string
  description: React.ReactNode
  points: string[]
  /** 正方形アイコン */
  image: string
  /** 2:1 の紹介バナー */
  banner: string
  /** スマホモックの画面に流し込む画像。実機キャプチャが揃うまでの仮素材として banner/poster を流用。 */
  screens: string[]
  /** Play Console のクローズドテスト オプトイン URL。未発行/対象外は null。 */
  optInUrl: string | null
}

/** GRAFF.LAB（クローズドテスト中）の4アプリ。 */
export const APPS: App[] = [
  {
    slug: 'calc-rate',
    name: 'CALC/RATE',
    reading: 'カルクレート',
    tagline: '押した手応えのある電卓と、為替換算。',
    description:
      '7セグメント表示とシリコンキーの手触りにこだわった電卓。横スワイプで為替換算に切り替わり、最新レートで計算できます。',
    points: ['電卓 ⇄ 為替換算の2画面', '12通貨に対応', '計算履歴・多言語（日英韓中西）'],
    image: '/works/graff-lab/calc-rate.png',
    banner: '/works/graff-lab/banner-calc-rate.png',
    screens: ['/works/graff-lab/screen-calc.jpg', '/works/graff-lab/screen-rate.jpg'],
    optInUrl: 'https://play.google.com/apps/testing/com.graff.calc',
  },
  {
    slug: 'cache-snap',
    name: 'CACHE/SNAP',
    reading: 'キャッシュスナップ',
    tagline: '"消える"写真アプリ',
    description: (
      <>
        スマホのストレージを圧迫する写真。
        <br />
        そのほとんどは見返されることもなく、ただ積み上がっていきます。
        <br />
        <br />
        CACHE/SNAPで撮影した写真は、スマホのギャラリーには保存されません。
        <br />
        <br />
        アプリ内にキャッシュのように一時保管され、
        <br />
        7日後に自動で消えていきます。
        <br />
        <br />
        大切な写真だけ、端末に保存してください。
      </>
    ),
    points: ['一時保存ギャラリー', '7日後に自動削除', '端末保存'],
    image: '/works/graff-lab/cacheLogo.png',
    banner: '/works/graff-lab/cache-snap.jpg',
    screens: ['/works/graff-lab/screen-gallery.jpg', '/works/graff-lab/screen-camera.jpg'],
    optInUrl: 'https://play.google.com/apps/testing/com.graff.cachelink',
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
    banner: '/works/graff-lab/banner-shake-link.jpg',
    screens: ['/works/graff-lab/screen-widget.jpg', '/works/graff-lab/screen-links.jpg'],
    optInUrl: null, // TODO
  },
  {
    slug: 'moonphasetime',
    name: 'MOON PHASE WATCH WIDGET',
    reading: 'ムーンフェイズ ウォッチウィジェット',
    tagline: '月の満ち欠けを、ホーム画面に。',
    description:
      '月齢と時刻を金属筐体のガジェット風に表示するウィジェット。今夜の月がどんな形かひと目で分かります。',
    points: ['ホーム画面ウィジェット', '月齢を端末内で計算', '権限・通信なし'],
    image: '/works/graff-lab/moonphasetime.png',
    banner: '/works/graff-lab/banner-moonphasetime.jpg',
    screens: ['/works/graff-lab/screen-moon-home.jpg', '/works/graff-lab/screen-moon-widgets.jpg'],
    optInUrl: null, // TODO
  },
]

/** 製品版として公開済みのフラグシップアプリ。GRAFF.LABのテストプログラム対象外なので分けて定義。 */
export const WADACHI_FILM: App = {
  slug: 'wadachi-film',
  name: 'ワダチフイルム',
  reading: 'ワダチフイルム',
  tagline: '撮ることが、思い出になる。記録ではなく、追憶を残す散歩記録アプリ。',
  description:
    '出かける前にフィルムをセットし、使い切るまで撮影した写真は確認できません。現像ボタンを押した瞬間、歩いた道が地図に一本の軌跡として浮かび上がります。',
  points: ['12/24/36枚のフィルム制', '現像後に軌跡が地図に浮かぶ', '個人情報を収集しない'],
  image: '/graffLogo.svg',
  banner: '/works/wadachi-film/cover.jpg',
  screens: ['/works/wadachi-film/screen-shelf.jpg', '/works/wadachi-film/screen-map.jpg'],
  optInUrl: null,
}

/** HOME画面のアプリショーケース用ラインナップ（表示順）。 */
export const SHOWCASE_APPS: App[] = [WADACHI_FILM, ...APPS]
