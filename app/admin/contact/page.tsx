import { initSchema, getContactSettings, getAllSubmissions } from '@/app/lib/db'
import { updateContactSettings, updateSubmissionStatus, deleteSubmission } from '@/app/actions/admin'
import DeleteButton from '../_components/DeleteButton'
import SubmissionStatus from '../_components/SubmissionStatus'

const FIELD = 'w-full bg-surface-container border border-outline-variant rounded px-3 py-3 md:py-2 text-xs text-on-surface focus:outline-none focus:border-accent-neon transition-colors'
const LABEL = 'block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5'

export default async function ContactPage() {
  await initSchema()
  const [settings, submissions] = await Promise.all([
    getContactSettings(),
    getAllSubmissions(),
  ])

  return (
    <div className="space-y-12">

      {/* Settings */}
      <section>
        <h1 className="text-xs uppercase tracking-widest text-on-surface-variant mb-6">Contact — Settings</h1>
        <form action={updateContactSettings} className="space-y-4 max-w-lg">
          <div>
            <label className={LABEL}>Tagline</label>
            <input name="tagline" defaultValue={settings.tagline} className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Email</label>
            <input name="email" type="email" defaultValue={settings.email} className={FIELD} placeholder="hello@example.com" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Twitter</label>
              <input name="twitter" defaultValue={settings.twitter} className={FIELD} placeholder="@username" />
            </div>
            <div>
              <label className={LABEL}>GitHub</label>
              <input name="github" defaultValue={settings.github} className={FIELD} placeholder="username" />
            </div>
            <div>
              <label className={LABEL}>Instagram</label>
              <input name="instagram" defaultValue={settings.instagram} className={FIELD} placeholder="@username" />
            </div>
          </div>
          <button type="submit" className="px-4 py-2.5 md:py-1.5 bg-accent-neon text-background text-[10px] uppercase tracking-widest font-bold rounded hover:opacity-90 transition-opacity">
            Save Settings
          </button>
        </form>
      </section>

      {/* Submissions */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-on-surface-variant mb-6">
          Messages
          {submissions.filter(s => s.status === 'unread').length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-accent-neon/20 text-accent-neon rounded text-[10px]">
              {submissions.filter(s => s.status === 'unread').length} unread
            </span>
          )}
        </h2>

        {submissions.length === 0 ? (
          <p className="text-on-surface-variant text-xs">メッセージはありません。</p>
        ) : (
          <div className="space-y-3">
            {submissions.map(sub => (
              <details key={sub.id} className={`border rounded ${sub.status === 'unread' ? 'border-accent-neon/40' : 'border-outline-variant'}`}>
                <summary className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors list-none">
                  {sub.status === 'unread' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-neon shrink-0" />
                  )}
                  <span className="text-xs text-on-surface flex-1">{sub.name}</span>
                  <span className="text-xs text-on-surface-variant hidden md:block">{sub.email}</span>
                  <span className="text-[10px] text-on-surface-variant shrink-0">{sub.created_at.slice(0, 10)}</span>
                </summary>
                <div className="border-t border-outline-variant p-4 space-y-3">
                  <p className="text-xs text-on-surface-variant">{sub.email}</p>
                  <p className="text-sm text-on-surface whitespace-pre-wrap">{sub.message}</p>
                  <div className="flex gap-2 items-center">
                    <SubmissionStatus id={sub.id} current={sub.status} action={updateSubmissionStatus} />
                    <DeleteButton action={deleteSubmission.bind(null, sub.id)} label="Delete" />
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
