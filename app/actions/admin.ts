'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import db, { initSchema } from '@/app/lib/db'
import { createSessionToken, verifySessionToken, SESSION_COOKIE } from '@/app/lib/session'

// ─── Auth ─────────────────────────────────────────────────

export async function login(_: unknown, formData: FormData) {
  const password = formData.get('password') as string
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'パスワードが違います' }
  }
  const token = await createSessionToken()
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  redirect('/admin/dashboard')
}

export async function logout() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  redirect('/admin/login')
}

async function requireAdmin() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token || !(await verifySessionToken(token))) redirect('/admin/login')
}

// ─── Works ────────────────────────────────────────────────

export async function createWork(_: unknown, formData: FormData) {
  await requireAdmin()
  await initSchema()

  const slug = (formData.get('slug') as string).trim()
  const title = (formData.get('title') as string).trim()
  const num = (formData.get('num') as string).trim()
  const tag = formData.get('tag') as string
  const year = Number(formData.get('year'))
  const role = (formData.get('role') as string).split(',').map(s => s.trim()).filter(Boolean)
  const short_desc = (formData.get('short_desc') as string).trim()
  const body = (formData.get('body') as string).trim()
  const tech_stack = (formData.get('tech_stack') as string).split(',').map(s => s.trim()).filter(Boolean)
  const images = JSON.parse((formData.get('images') as string) || '[]') as string[]
  const url = (formData.get('url') as string).trim()
  const github = (formData.get('github') as string).trim()
  const status = formData.get('status') as string

  await db.execute({
    sql: `INSERT INTO works (slug, num, title, tag, year, role, short_desc, body, tech_stack, images, url, github, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [slug, num, title, tag, year, JSON.stringify(role), short_desc, body, JSON.stringify(tech_stack), JSON.stringify(images), url, github, status],
  })

  revalidatePath('/works')
  revalidatePath('/')
  redirect('/admin/works')
}

export async function updateWork(_: unknown, formData: FormData) {
  await requireAdmin()

  const id = Number(formData.get('id'))
  const slug = (formData.get('slug') as string).trim()
  const title = (formData.get('title') as string).trim()
  const num = (formData.get('num') as string).trim()
  const tag = formData.get('tag') as string
  const year = Number(formData.get('year'))
  const role = (formData.get('role') as string).split(',').map(s => s.trim()).filter(Boolean)
  const short_desc = (formData.get('short_desc') as string).trim()
  const body = (formData.get('body') as string).trim()
  const tech_stack = (formData.get('tech_stack') as string).split(',').map(s => s.trim()).filter(Boolean)
  const images = JSON.parse((formData.get('images') as string) || '[]') as string[]
  const url = (formData.get('url') as string).trim()
  const github = (formData.get('github') as string).trim()
  const status = formData.get('status') as string

  await db.execute({
    sql: `UPDATE works SET slug=?, num=?, title=?, tag=?, year=?, role=?, short_desc=?, body=?, tech_stack=?, images=?, url=?, github=?, status=?, updated_at=datetime('now')
          WHERE id=?`,
    args: [slug, num, title, tag, year, JSON.stringify(role), short_desc, body, JSON.stringify(tech_stack), JSON.stringify(images), url, github, status, id],
  })

  revalidatePath('/works')
  revalidatePath(`/works/${slug}`)
  revalidatePath('/')
  redirect('/admin/works')
}

export async function deleteWork(id: number) {
  await requireAdmin()
  await db.execute({ sql: 'DELETE FROM works WHERE id = ?', args: [id] })
  revalidatePath('/works')
  revalidatePath('/')
  revalidatePath('/admin/works')
}

// ─── Services ─────────────────────────────────────────────

export async function createService(formData: FormData) {
  await requireAdmin()
  await initSchema()

  await db.execute({
    sql: 'INSERT INTO services (title, description, icon, sort_order) VALUES (?, ?, ?, ?)',
    args: [
      (formData.get('title') as string).trim(),
      (formData.get('description') as string).trim(),
      (formData.get('icon') as string).trim(),
      Number(formData.get('sort_order') ?? 0),
    ],
  })

  revalidatePath('/')
  redirect('/admin/services')
}

export async function updateService(formData: FormData) {
  await requireAdmin()

  await db.execute({
    sql: 'UPDATE services SET title=?, description=?, icon=?, sort_order=? WHERE id=?',
    args: [
      (formData.get('title') as string).trim(),
      (formData.get('description') as string).trim(),
      (formData.get('icon') as string).trim(),
      Number(formData.get('sort_order') ?? 0),
      Number(formData.get('id')),
    ],
  })

  revalidatePath('/')
  redirect('/admin/services')
}

export async function deleteService(id: number) {
  await requireAdmin()
  await db.execute({ sql: 'DELETE FROM services WHERE id = ?', args: [id] })
  revalidatePath('/')
  revalidatePath('/admin/services')
}

// ─── News ─────────────────────────────────────────────────

export async function createNews(formData: FormData) {
  await requireAdmin()
  await initSchema()

  await db.execute({
    sql: 'INSERT INTO news (date, title, tag, url) VALUES (?, ?, ?, ?)',
    args: [
      (formData.get('date') as string).trim(),
      (formData.get('title') as string).trim(),
      (formData.get('tag') as string).trim(),
      (formData.get('url') as string).trim(),
    ],
  })

  revalidatePath('/')
  redirect('/admin/news')
}

export async function updateNews(formData: FormData) {
  await requireAdmin()

  await db.execute({
    sql: 'UPDATE news SET date=?, title=?, tag=?, url=? WHERE id=?',
    args: [
      (formData.get('date') as string).trim(),
      (formData.get('title') as string).trim(),
      (formData.get('tag') as string).trim(),
      (formData.get('url') as string).trim(),
      Number(formData.get('id')),
    ],
  })

  revalidatePath('/')
  redirect('/admin/news')
}

export async function deleteNews(id: number) {
  await requireAdmin()
  await db.execute({ sql: 'DELETE FROM news WHERE id = ?', args: [id] })
  revalidatePath('/')
  revalidatePath('/admin/news')
}

// ─── Contact Settings ─────────────────────────────────────

export async function updateContactSettings(formData: FormData) {
  await requireAdmin()
  await initSchema()

  await db.execute({
    sql: 'INSERT INTO contact_settings (id, email, twitter, github, instagram, tagline) VALUES (1, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email=excluded.email, twitter=excluded.twitter, github=excluded.github, instagram=excluded.instagram, tagline=excluded.tagline',
    args: [
      (formData.get('email') as string).trim(),
      (formData.get('twitter') as string).trim(),
      (formData.get('github') as string).trim(),
      (formData.get('instagram') as string).trim(),
      (formData.get('tagline') as string).trim(),
    ],
  })

  revalidatePath('/')
}

// ─── Contact Submissions ──────────────────────────────────

export async function updateSubmissionStatus(id: number, status: string) {
  await requireAdmin()
  await db.execute({ sql: 'UPDATE contact_submissions SET status=? WHERE id=?', args: [status, id] })
  revalidatePath('/admin/contact')
}

export async function deleteSubmission(id: number) {
  await requireAdmin()
  await db.execute({ sql: 'DELETE FROM contact_submissions WHERE id=?', args: [id] })
  revalidatePath('/admin/contact')
}
