export interface SessionPayload {
  admin: boolean
  createdAt: number
}

/**
 * Store a session token in Cloudflare KV with expiry.
 * @param token - random session token
 * @param payload - data to store
 * @param ttlSeconds - expiry time (default 1 hour)
 */
export async function storeSessionToken(
  token: string,
  payload: SessionPayload,
  ttlSeconds: number = 3600
): Promise<void> {
  // SESSION_STORE is a KV namespace bound in wrangler.toml or Cloudflare Pages settings
  await SESSION_STORE.put(token, JSON.stringify(payload), { expirationTtl: ttlSeconds })
}

/**
 * Retrieve and verify a session token.
 * @returns payload or null if expired/not found
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const data = await SESSION_STORE.get(token)
  if (!data) return null
  return JSON.parse(data) as SessionPayload
}
