'use client'

const STATUSES = ['unread', 'read', 'replied'] as const
type Status = typeof STATUSES[number]

export default function SubmissionStatus({
  id,
  current,
  action,
}: {
  id: number
  current: string
  action: (id: number, status: string) => Promise<void>
}) {
  return (
    <select
      defaultValue={current}
      onChange={e => action(id, e.target.value)}
      className="bg-surface-container border border-outline-variant rounded px-2 py-1 text-[10px] uppercase tracking-widest text-on-surface-variant focus:outline-none focus:border-accent-neon"
    >
      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}
