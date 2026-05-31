'use server'

import db, { initSchema } from '@/app/lib/db'

export async function submitContact(_: unknown, formData: FormData) {
  await initSchema()

  const name = (formData.get('name') as string ?? '').trim()
  const email = (formData.get('email') as string ?? '').trim()
  const message = (formData.get('message') as string ?? '').trim()

  if (!name || !email || !message) return { error: '全ての項目を入力してください' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: '正しいメールアドレスを入力してください' }

  await db.execute({
    sql: 'INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)',
    args: [name, email, message],
  })

  return { success: true }
}
