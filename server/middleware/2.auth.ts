import { eventHandler, getHeader, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { verifySessionToken } from '~/server/utils/session'

export default eventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')?.replace(/^Bearer\s+/, '')
  const path = event.path

  // Allow public access to the login endpoint
  if (path === '/api/auth/login') return

  // Protect all other API routes
  if (path.startsWith('/api/')) {
    if (!token) {
      throw createError({ status: 401, statusText: 'Unauthorized' })
    }

    const config = useRuntimeConfig(event)

    // 1. Check static site token (original behaviour)
    if (token === config.siteToken) {
      return
    }

    // 2. Check admin session token
    const session = await verifySessionToken(token)
    if (session && session.admin === true) {
      // Attach session info to context for downstream use (optional)
      event.context.auth = { admin: true, sessionCreated: session.createdAt }
      return
    }

    throw createError({ status: 401, statusText: 'Unauthorized' })
  }

  if (token && token.length < 8) {
    throw createError({ status: 401, statusText: 'Token is too short' })
  }
})
