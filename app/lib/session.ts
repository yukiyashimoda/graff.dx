const enc = new TextEncoder()

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? 'fallback-dev-secret'
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function createSessionToken(): Promise<string> {
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('graff:admin'))
  return Buffer.from(sig).toString('base64url')
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const key = await getKey()
    const sig = Buffer.from(token, 'base64url')
    return await crypto.subtle.verify('HMAC', key, sig, enc.encode('graff:admin'))
  } catch {
    return false
  }
}

export const SESSION_COOKIE = 'graff_admin_session'
