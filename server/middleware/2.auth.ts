import { eventHandler, getHeader, getCookie, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { verifySessionToken } from '~/server/utils/session.ts'

export default eventHandler(async (event) => {
  const path = event.path

  // Allow public access to login endpoint
  if (path === '/api/auth/login') return

  // Protect all API routes
  if (path.startsWith('/api/')) {
    // 1. Try to get token from cookie (primary)
    let token = getCookie(event, 'auth_token')
    
    // 2. Fallback to Authorization header (for non‑browser clients)
    if (!token) {
      token = getHeader(event, 'Authorization')?.replace(/^Bearer\s+/, '')
    }

    if (!token) {
      throw createError({ status: 401, statusText: 'Unauthorized' })
    }

    const config = useRuntimeConfig(event)

    // Check static site token (original behaviour)
    if (token === config.siteToken) {
      return
    }

    // Check admin session token
    const session = await verifySessionToken(token)
    if (session && session.admin === true) {
      event.context.auth = { admin: true, sessionCreated: session.createdAt }
      return
    }

    throw createError({ status: 401, statusText: 'Unauthorized' })
  }

  // Optional: protect non‑API routes (like /dashboard) if they are server‑rendered
  if (path.startsWith('/dashboard') && !getCookie(event, 'auth_token')) {
    return sendRedirect(event, '/login')
  }
})
