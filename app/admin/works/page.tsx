import Link from 'next/link'
import { initSchema, getAllWorks } from '@/app/lib/db'
import DeleteButton from '../_components/DeleteButton'
import { deleteWork } from '@/app/actions/admin'

export default async function WorksPage() {
  await initSchema()
  const works = await getAllWorks()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xs uppercase tracking-widest text-on-surface-variant">Works — Portfolio</h1>
        <Link
          href="/admin/works/new"
          className="px-4 py-2 bg-accent-neon text-background text-xs uppercase tracking-widest font-bold rounded hover:opacity-90 transition-opacity"
        >
          + New
        </Link>
      </div>

      {works.length === 0 ? (
        <p className="text-on-surface-variant text-xs">まだありません。</p>
      ) : (
        <div className="border border-outline-variant rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                <th className="text-left px-4 py-3 uppercase tracking-widest text-on-surface-variant">Title</th>
                <th className="text-left px-4 py-3 uppercase tracking-widest text-on-surface-variant hidden md:table-cell">Tag</th>
                <th className="text-left px-4 py-3 uppercase tracking-widest text-on-surface-variant hidden md:table-cell">Year</th>
                <th className="text-left px-4 py-3 uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {works.map(work => (
                <tr key={work.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container transition-colors">
                  <td className="px-4 py-3 text-on-surface">{work.title}</td>
                  <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">{work.tag}</td>
                  <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">{work.year || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest ${
                      work.status === 'published'
                        ? 'bg-accent-neon/10 text-accent-neon'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {work.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 flex gap-2 justify-end">
                    <Link
                      href={`/admin/works/${work.id}`}
                      className="px-3 py-2 border border-outline-variant rounded text-[10px] uppercase tracking-widest hover:border-accent-neon hover:text-accent-neon transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteWork.bind(null, work.id)} label="Del" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
