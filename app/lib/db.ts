import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export default db

export async function initSchema() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      num TEXT DEFAULT '',
      title TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT 'PRODUCT',
      year INTEGER DEFAULT 0,
      role TEXT DEFAULT '[]',
      short_desc TEXT DEFAULT '',
      body TEXT DEFAULT '',
      tech_stack TEXT DEFAULT '[]',
      images TEXT DEFAULT '[]',
      url TEXT DEFAULT '',
      github TEXT DEFAULT '',
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      tag TEXT NOT NULL DEFAULT 'NEWS',
      url TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS contact_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      email TEXT DEFAULT '',
      twitter TEXT DEFAULT '',
      github TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      tagline TEXT DEFAULT 'お仕事のご相談、お気軽にどうぞ。'
    )`,
    `CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `INSERT OR IGNORE INTO contact_settings (id) VALUES (1)`,
  ], 'write')
}

// ─── Types ───────────────────────────────────────────────

export type Work = {
  id: number
  slug: string
  num: string
  title: string
  tag: 'PRODUCT' | 'CLIENT WORK'
  year: number
  role: string[]
  short_desc: string
  body: string
  tech_stack: string[]
  images: string[]
  url: string
  github: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export type Service = {
  id: number
  title: string
  description: string
  icon: string
  sort_order: number
}

export type NewsItem = {
  id: number
  date: string
  title: string
  tag: string
  url: string
  created_at: string
}

export type ContactSettings = {
  id: number
  email: string
  twitter: string
  github: string
  instagram: string
  tagline: string
}

export type ContactSubmission = {
  id: number
  name: string
  email: string
  message: string
  status: 'unread' | 'read' | 'replied'
  created_at: string
}

// ─── Helpers — libsql Row はクラスインスタンスなので必ず plain object に変換する ───

function parseWork(r: Record<string, unknown>): Work {
  return {
    id: Number(r.id),
    slug: String(r.slug ?? ''),
    num: String(r.num ?? ''),
    title: String(r.title ?? ''),
    tag: (r.tag ?? 'PRODUCT') as Work['tag'],
    year: Number(r.year ?? 0),
    role: JSON.parse(String(r.role || '[]')),
    short_desc: String(r.short_desc ?? ''),
    body: String(r.body ?? ''),
    tech_stack: JSON.parse(String(r.tech_stack || '[]')),
    images: JSON.parse(String(r.images || '[]')),
    url: String(r.url ?? ''),
    github: String(r.github ?? ''),
    status: (r.status ?? 'draft') as Work['status'],
    created_at: String(r.created_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
  }
}

export async function getAllWorks(): Promise<Work[]> {
  const result = await db.execute('SELECT * FROM works ORDER BY created_at DESC')
  return result.rows.map(r => parseWork(r as Record<string, unknown>))
}

export async function getPublishedWorks(): Promise<Work[]> {
  const result = await db.execute("SELECT * FROM works WHERE status = 'published' ORDER BY created_at DESC")
  return result.rows.map(r => parseWork(r as Record<string, unknown>))
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const result = await db.execute({ sql: 'SELECT * FROM works WHERE slug = ?', args: [slug] })
  if (!result.rows[0]) return null
  return parseWork(result.rows[0] as Record<string, unknown>)
}

export async function getWorkById(id: number): Promise<Work | null> {
  const result = await db.execute({ sql: 'SELECT * FROM works WHERE id = ?', args: [id] })
  if (!result.rows[0]) return null
  return parseWork(result.rows[0] as Record<string, unknown>)
}

export async function getAllServices(): Promise<Service[]> {
  const result = await db.execute('SELECT * FROM services ORDER BY sort_order ASC')
  return result.rows.map(r => ({
    id: Number(r.id),
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    icon: String(r.icon ?? ''),
    sort_order: Number(r.sort_order ?? 0),
  }))
}

export async function getAllNews(): Promise<NewsItem[]> {
  const result = await db.execute('SELECT * FROM news ORDER BY date DESC')
  return result.rows.map(r => ({
    id: Number(r.id),
    date: String(r.date ?? ''),
    title: String(r.title ?? ''),
    tag: String(r.tag ?? ''),
    url: String(r.url ?? ''),
    created_at: String(r.created_at ?? ''),
  }))
}

export async function getContactSettings(): Promise<ContactSettings> {
  const result = await db.execute('SELECT * FROM contact_settings WHERE id = 1')
  const r = result.rows[0]
  if (!r) return { id: 1, email: '', twitter: '', github: '', instagram: '', tagline: 'お仕事のご相談、お気軽にどうぞ。' }
  return {
    id: Number(r.id),
    email: String(r.email ?? ''),
    twitter: String(r.twitter ?? ''),
    github: String(r.github ?? ''),
    instagram: String(r.instagram ?? ''),
    tagline: String(r.tagline ?? ''),
  }
}

export async function getAllSubmissions(): Promise<ContactSubmission[]> {
  const result = await db.execute('SELECT * FROM contact_submissions ORDER BY created_at DESC')
  return result.rows.map(r => ({
    id: Number(r.id),
    name: String(r.name ?? ''),
    email: String(r.email ?? ''),
    message: String(r.message ?? ''),
    status: (r.status ?? 'unread') as ContactSubmission['status'],
    created_at: String(r.created_at ?? ''),
  }))
}
