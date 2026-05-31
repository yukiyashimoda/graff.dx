import { initSchema, getAllServices } from '@/app/lib/db'
import { createService, updateService, deleteService } from '@/app/actions/admin'
import DeleteButton from '../_components/DeleteButton'
import type { Service } from '@/app/lib/db'

const FIELD = 'bg-surface-container border border-outline-variant rounded px-3 py-3 md:py-2 text-xs text-on-surface focus:outline-none focus:border-accent-neon transition-colors'
const LABEL = 'block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5'

function ServiceRow({ service }: { service: Service }) {
  return (
    <details className="border border-outline-variant rounded">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors list-none">
        <span className="text-xs text-on-surface flex items-center gap-3">
          {service.icon && <span className="text-base">{service.icon}</span>}
          {service.title}
        </span>
        <span className="text-[10px] text-on-surface-variant">#{service.sort_order} — Edit ▾</span>
      </summary>
      <div className="border-t border-outline-variant p-4">
        <form action={updateService} className="space-y-3">
          <input type="hidden" name="id" value={service.id} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Title</label>
              <input name="title" defaultValue={service.title} required className={`${FIELD} w-full`} />
            </div>
            <div>
              <label className={LABEL}>Icon（絵文字）</label>
              <input name="icon" defaultValue={service.icon} className={`${FIELD} w-full`} placeholder="🎨" />
            </div>
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea name="description" defaultValue={service.description} rows={2} className={`${FIELD} w-full resize-none`} />
          </div>
          <div>
            <label className={LABEL}>Sort Order</label>
            <input name="sort_order" type="number" defaultValue={service.sort_order} className={`${FIELD} w-24`} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2.5 md:py-1.5 bg-accent-neon text-background text-[10px] uppercase tracking-widest font-bold rounded hover:opacity-90 transition-opacity">
              Update
            </button>
            <DeleteButton action={deleteService.bind(null, service.id)} label="Delete" />
          </div>
        </form>
      </div>
    </details>
  )
}

export default async function ServicesPage() {
  await initSchema()
  const services = await getAllServices()

  return (
    <div>
      <h1 className="text-xs uppercase tracking-widest text-on-surface-variant mb-8">Services — 受注可能ジャンル</h1>

      <div className="space-y-2 mb-10">
        {services.length === 0
          ? <p className="text-on-surface-variant text-xs">まだありません。</p>
          : services.map(s => <ServiceRow key={s.id} service={s} />)
        }
      </div>

      <div className="border border-outline-variant rounded p-6">
        <h2 className="text-[10px] uppercase tracking-widest text-accent-neon mb-4">+ New Service</h2>
        <form action={createService} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Title *</label>
              <input name="title" required className={`${FIELD} w-full`} placeholder="Web Design" />
            </div>
            <div>
              <label className={LABEL}>Icon（絵文字）</label>
              <input name="icon" className={`${FIELD} w-full`} placeholder="🎨" />
            </div>
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea name="description" rows={2} className={`${FIELD} w-full resize-none`} />
          </div>
          <div>
            <label className={LABEL}>Sort Order</label>
            <input name="sort_order" type="number" defaultValue={services.length} className={`${FIELD} w-24`} />
          </div>
          <button type="submit" className="px-4 py-2.5 md:py-1.5 bg-accent-neon text-background text-[10px] uppercase tracking-widest font-bold rounded hover:opacity-90 transition-opacity">
            Create
          </button>
        </form>
      </div>
    </div>
  )
}
