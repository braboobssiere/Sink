export interface SessionPayload {
  admin: boolean
  createdAt: number
}

const SESSION_PREFIX = 'session_'

export async function storeSessionToken(
  token: string,
  payload: SessionPayload,
  ttlSeconds = 86400
): Promise<void> {
  await KV.put(`${SESSION_PREFIX}${token}`, JSON.stringify(payload), { expirationTtl: ttlSeconds })
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const data = await KV.get(`${SESSION_PREFIX}${token}`)
  if (!data) return null
  return JSON.parse(data)
}
