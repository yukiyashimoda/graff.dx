import { initSchema, getAllWorks, getAllNews, getAllSubmissions, getAllServices } from '@/app/lib/db'

export default async function DashboardPage() {
  await initSchema()
  const [works, news, submissions, services] = await Promise.all([
    getAllWorks(),
    getAllNews(),
    getAllSubmissions(),
    getAllServices(),
  ])
  const unread = submissions.filter(s => s.status === 'unread').length

  const stats = [
    { label: 'Works', value: works.length, sub: `${works.filter(w => w.status === 'published').length} published` },
    { label: 'Services', value: services.length, sub: 'genres' },
    { label: 'News', value: news.length, sub: 'items' },
    { label: 'Messages', value: submissions.length, sub: `${unread} unread`, accent: unread > 0 },
  ]

  return (
    <div>
      <h1 className="text-xs uppercase tracking-widest text-on-surface-variant mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map(s => (
          <div key={s.label} className="bg-surface-container-low border border-outline-variant rounded p-4">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">{s.label}</p>
            <p className={`text-3xl font-bold mb-1 ${s.accent ? 'text-accent-neon' : 'text-on-surface'}`}>{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.sub}</p>
          </div>
        ))}
      </div>

      {unread > 0 && (
        <div className="bg-accent-neon/10 border border-accent-neon/30 rounded p-4 text-sm">
          <span className="text-accent-neon font-bold">✦ </span>
          <span className="text-on-surface">{unread}件の未読メッセージがあります。</span>
          <a href="/admin/contact" className="ml-2 text-accent-neon underline underline-offset-2">確認する →</a>
        </div>
      )}
    </div>
  )
}
