export interface SessionPayload {
  admin: boolean
  createdAt: number
}

const SESSION_PREFIX = 'session_'

/**
 * Store a session token in Cloudflare KV.
 * The token expires after 24 hour.
 */
export async function storeSessionToken(
  token: string,
  payload: SessionPayload,
  ttlSeconds = 86400
): Promise<void> {
  const key = `${SESSION_PREFIX}${token}`
  await KV.put(key, JSON.stringify(payload), { expirationTtl: ttlSeconds })
}

/**
 * Retrieve and verify a session token.
 * Returns null if the token is invalid or expired.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const key = `${SESSION_PREFIX}${token}`
  const data = await KV.get(key)
  if (!data) return null
  return JSON.parse(data)
}
