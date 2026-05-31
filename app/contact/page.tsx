'use client'

import { useActionState } from 'react'
import TopNavBar from '../components/TopNavBar'
import { submitContact } from '../actions/contact'

export default function ContactPage() {
  const [state, action, pending] = useActionState(submitContact, null)

  if (state?.success) {
    return (
      <>
        <TopNavBar />
        <main className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
          <div className="text-center max-w-md">
            <p className="text-accent-neon font-label-mono text-label-mono uppercase tracking-widest mb-4">✦ Sent</p>
            <h1 className="text-headline-lg-mobile font-bold uppercase mb-6">Thank you.</h1>
            <p className="text-on-surface-variant font-body-sm text-body-sm mb-8">
              メッセージを受け取りました。折り返しご連絡します。
            </p>
            <a href="/" className="font-label-mono text-label-mono uppercase tracking-widest text-accent-neon hover:underline">
              ← Back to Home
            </a>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopNavBar />
      <main className="min-h-screen bg-background pt-28 pb-32 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mx-auto">

          <div className="mb-16">
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-[0.3em] block mb-4">
              Contact
            </span>
            <h1
              className="text-[14vw] md:text-[6vw] font-bold uppercase leading-none tracking-tight"
              style={{ fontFamily: 'var(--ff-share-tech)' }}
            >
              GET IN TOUCH
            </h1>
          </div>

          <form action={action} className="space-y-6">
            <div>
              <label className="block font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                Name *
              </label>
              <input
                name="name"
                required
                className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-accent-neon transition-colors"
              />
            </div>

            <div>
              <label className="block font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                Email *
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-accent-neon transition-colors"
              />
            </div>

            <div>
              <label className="block font-label-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                Message *
              </label>
              <textarea
                name="message"
                required
                rows={8}
                className="w-full bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-accent-neon transition-colors resize-none"
              />
            </div>

            {state?.error && (
              <p className="text-red-400 font-label-mono text-[11px]">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-5 bg-accent-neon text-background font-label-mono text-label-mono uppercase tracking-widest font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {pending ? 'Sending...' : 'Send →'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
