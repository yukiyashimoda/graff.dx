import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/app/lib/session'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 8 * 1024 * 1024 // 8MB

export async function POST(request: Request) {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: 'JPEG/PNG/WebP/GIF のみ対応' }, { status: 400 })
  if (file.size > MAX_BYTES) return Response.json({ error: '8MB 以下の画像を使用してください' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const key = `works/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }))

  return Response.json({ url: `${process.env.R2_PUBLIC_URL}/${key}` })
}
