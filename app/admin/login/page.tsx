'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/admin'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" style={{ fontFamily: 'var(--ff-jetbrains)' }}>
      <div className="w-full max-w-sm p-8 bg-surface-container-low border border-outline-variant rounded">
        <h1 className="text-accent-neon text-sm uppercase tracking-widest font-bold mb-8">graff.admin</h1>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-surface-container border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-accent-neon transition-colors"
              autoFocus
            />
          </div>

          {state?.error && (
            <p className="text-xs text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 bg-accent-neon text-background text-xs uppercase tracking-widest font-bold rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? '...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
