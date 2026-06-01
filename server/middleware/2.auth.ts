import { eventHandler, getHeader, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { verifySessionToken } from '~/server/utils/session'

export default eventHandler(async (event) => {
  // Only protect API routes
  if (!event.path.startsWith('/api/')) return

  const authHeader = getHeader(event, 'Authorization')
  const token = authHeader?.replace(/^Bearer\s+/, '')

  if (!token) {
    throw createError({ status: 401, statusText: 'Missing Authorization header' })
  }

  const config = useRuntimeConfig(event)

  // 1. Check the static site token (existing behaviour)
  if (token === config.siteToken) {
    return
  }

  // 2. Check for a valid admin session token
  const session = await verifySessionToken(token)
  if (session && session.admin === true) {
    // Optionally attach session info to the event context
    event.context.auth = { admin: true, sessionCreated: session.createdAt }
    return
  }

  // 3. Reject if neither token is valid
  throw createError({ status: 401, statusText: 'Unauthorized' })
})
