'use client'

import { useActionState } from 'react'
import type { Work } from '@/app/lib/db'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = {
  action: (prev: any, formData: FormData) => Promise<any>
  work?: Work
}

const FIELD = 'w-full bg-surface-container border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-accent-neon transition-colors'
const LABEL = 'block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1'

export default function WorkForm({ action, work }: Props) {
  const [, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {work && <input type="hidden" name="id" value={work.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Slug *</label>
          <input name="slug" required defaultValue={work?.slug} className={FIELD} placeholder="my-project" />
        </div>
        <div>
          <label className={LABEL}>Num</label>
          <input name="num" defaultValue={work?.num} className={FIELD} placeholder="01" />
        </div>
      </div>

      <div>
        <label className={LABEL}>Title *</label>
        <input name="title" required defaultValue={work?.title} className={FIELD} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Tag</label>
          <select name="tag" defaultValue={work?.tag ?? 'PRODUCT'} className={FIELD}>
            <option value="PRODUCT">PRODUCT</option>
            <option value="CLIENT WORK">CLIENT WORK</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Year</label>
          <input name="year" type="number" defaultValue={work?.year ?? new Date().getFullYear()} className={FIELD} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Role（カンマ区切り）</label>
        <input name="role" defaultValue={work?.role?.join(', ')} className={FIELD} placeholder="Design, Develop" />
      </div>

      <div>
        <label className={LABEL}>Short Description</label>
        <input name="short_desc" defaultValue={work?.short_desc} className={FIELD} />
      </div>

      <div>
        <label className={LABEL}>Body（Markdown）</label>
        <textarea
          name="body"
          defaultValue={work?.body}
          rows={16}
          className={`${FIELD} resize-y font-mono text-xs`}
          placeholder="## 概要&#10;&#10;プロジェクトの詳細をMarkdownで記述..."
        />
      </div>

      <div>
        <label className={LABEL}>Tech Stack（カンマ区切り）</label>
        <input name="tech_stack" defaultValue={work?.tech_stack?.join(', ')} className={FIELD} placeholder="Next.js, TypeScript, Supabase" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>URL</label>
          <input name="url" type="url" defaultValue={work?.url} className={FIELD} placeholder="https://..." />
        </div>
        <div>
          <label className={LABEL}>GitHub</label>
          <input name="github" type="url" defaultValue={work?.github} className={FIELD} placeholder="https://github.com/..." />
        </div>
      </div>

      <div>
        <label className={LABEL}>Status</label>
        <select name="status" defaultValue={work?.status ?? 'draft'} className={FIELD}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2 bg-accent-neon text-background text-xs uppercase tracking-widest font-bold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? '...' : work ? 'Update' : 'Create'}
        </button>
        <a
          href="/admin/works"
          className="px-6 py-2 border border-outline-variant text-xs uppercase tracking-widest rounded hover:border-on-surface-variant transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
