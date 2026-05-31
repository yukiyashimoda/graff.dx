import { initSchema, getAllNews } from '@/app/lib/db'
import { createNews, updateNews, deleteNews } from '@/app/actions/admin'
import DeleteButton from '../_components/DeleteButton'
import type { NewsItem } from '@/app/lib/db'

const FIELD = 'bg-surface-container border border-outline-variant rounded px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-accent-neon transition-colors'
const LABEL = 'block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1'

const TAGS = ['RELEASE', 'WORKS', 'EVENT', 'NEWS', 'OTHER']

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <details className="border border-outline-variant rounded">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors list-none">
        <span className="text-xs text-on-surface-variant shrink-0 mr-4">{item.date}</span>
        <span className="text-xs text-on-surface flex-1 truncate">{item.title}</span>
        <span className="text-[10px] border border-outline-variant px-2 py-0.5 uppercase tracking-widest text-on-surface-variant ml-4 shrink-0">{item.tag}</span>
      </summary>
      <div className="border-t border-outline-variant p-4">
        <form action={updateNews} className="space-y-3">
          <input type="hidden" name="id" value={item.id} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Date</label>
              <input name="date" defaultValue={item.date} required className={`${FIELD} w-full`} placeholder="2026.05.31" />
            </div>
            <div>
              <label className={LABEL}>Tag</label>
              <select name="tag" defaultValue={item.tag} className={`${FIELD} w-full`}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Title *</label>
            <input name="title" defaultValue={item.title} required className={`${FIELD} w-full`} />
          </div>
          <div>
            <label className={LABEL}>URL（任意）</label>
            <input name="url" type="url" defaultValue={item.url} className={`${FIELD} w-full`} placeholder="https://..." />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-1.5 bg-accent-neon text-background text-[10px] uppercase tracking-widest font-bold rounded hover:opacity-90 transition-opacity">
              Update
            </button>
            <DeleteButton action={deleteNews.bind(null, item.id)} label="Delete" />
          </div>
        </form>
      </div>
    </details>
  )
}

export default async function NewsPage() {
  await initSchema()
  const news = await getAllNews()

  return (
    <div>
      <h1 className="text-xs uppercase tracking-widest text-on-surface-variant mb-8">News</h1>

      <div className="space-y-2 mb-10">
        {news.length === 0
          ? <p className="text-on-surface-variant text-xs">まだありません。</p>
          : news.map(item => <NewsRow key={item.id} item={item} />)
        }
      </div>

      <div className="border border-outline-variant rounded p-6">
        <h2 className="text-[10px] uppercase tracking-widest text-accent-neon mb-4">+ New Item</h2>
        <form action={createNews} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Date *</label>
              <input name="date" required className={`${FIELD} w-full`} placeholder="2026.05.31" />
            </div>
            <div>
              <label className={LABEL}>Tag</label>
              <select name="tag" defaultValue="NEWS" className={`${FIELD} w-full`}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Title *</label>
            <input name="title" required className={`${FIELD} w-full`} />
          </div>
          <div>
            <label className={LABEL}>URL（任意）</label>
            <input name="url" type="url" className={`${FIELD} w-full`} placeholder="https://..." />
          </div>
          <button type="submit" className="px-4 py-1.5 bg-accent-neon text-background text-[10px] uppercase tracking-widest font-bold rounded hover:opacity-90 transition-opacity">
            Create
          </button>
        </form>
      </div>
    </div>
  )
}
