export type Work = {
  slug: string
  num: string
  title: string
  tag: 'PRODUCT' | 'CLIENT WORK'
  year: number
  role: string[]
  shortDesc: string
  longDesc: string
  techStack: string[]
  images: string[]
  url?: string
  github?: string
}

export const works: Work[] = [
  {
    slug: 'graff-bms',
    num: '01',
    title: 'graff.bms',
    tag: 'PRODUCT',
    year: 2024,
    role: ['Design', 'Develop'],
    shortDesc: 'Bar Management System (OSS for restaurants)',
    longDesc:
      'graff.bms は飲食店向けのオープンソースバー管理システムです。注文管理・在庫管理・売上レポートを一元化し、現場スタッフの業務効率を大幅に改善します。モバイルファーストで設計されており、タブレット一台でフロアから厨房まで対応できます。',
    techStack: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    images: [],
    github: 'https://github.com/yukiyashimoda/graff-bms',
  },
  {
    slug: 'ichiyanagi-clinic',
    num: '02',
    title: 'ichiyanagi-clinic',
    tag: 'CLIENT WORK',
    year: 2024,
    role: ['Design', 'Develop'],
    shortDesc: '内科消化器科クリニック',
    longDesc:
      '地域密着型の内科・消化器科クリニックのウェブサイト制作。清潔感と信頼感を重視したデザインで、患者が必要な情報にすばやくアクセスできる導線設計を意識しました。オンライン問診票システムも実装し、待合室の業務負荷を軽減しています。',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    images: [],
  },
  {
    slug: 'trioki',
    num: '03',
    title: 'Trioki',
    tag: 'PRODUCT',
    year: 2024,
    role: ['Design', 'Develop'],
    shortDesc: 'LINE Mini App — Reservation system',
    longDesc:
      'LINE Mini App として開発した予約管理プラットフォーム。飲食店・美容室などの予約業務を LINE 上で完結できる仕組みで、顧客はアプリインストール不要で予約できます。店舗側も専用ダッシュボードで予約一覧・変更・キャンセル対応を管理できます。',
    techStack: ['React', 'TypeScript', 'LINE LIFF', 'Node.js', 'Prisma'],
    images: [],
  },
  {
    slug: 'avis',
    num: '04',
    title: 'Avis',
    tag: 'PRODUCT',
    year: 2024,
    role: ['Design', 'Develop'],
    shortDesc: 'Data analysis platform',
    longDesc:
      'ビジネスデータを可視化・分析するための SaaS プラットフォーム。CSV や API からデータを取り込み、ドラッグ&ドロップでダッシュボードを構築できます。チームメンバーとのリアルタイム共同編集にも対応しています。',
    techStack: ['React', 'TypeScript', 'D3.js', 'Python', 'FastAPI', 'PostgreSQL'],
    images: [],
  },
]

export function getWork(slug: string): Work | undefined {
  return works.find((w) => w.slug === slug)
}
