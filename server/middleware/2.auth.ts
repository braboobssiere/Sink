import { defineEventHandler, getRequestURL, createError, getHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { verifySessionToken } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Allow public access to the login endpoint
  if (url.pathname === '/api/auth/login') return

  // Protect all API routes
  if (!url.pathname.startsWith('/api/')) return

  const authHeader = getHeader(event, 'Authorization')
  const token = authHeader?.replace(/^Bearer\s+/, '')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Missing Authorization header' })
  }

  const config = useRuntimeConfig()

  // 1. Check the static site token (for API, embed, etc.)
  if (token === config.siteToken) {
    // The original code attaches no extra context, but you may add it if needed
    return
  }

  // 2. Check for a valid admin session token
  const session = await verifySessionToken(token)
  if (session && session.admin === true) {
    // Attach session info to the context so downstream handlers know the request is from an admin
    event.context.auth = { admin: true, sessionCreated: session.createdAt }
    return
  }

  throw createError({ statusCode: 401, message: 'Invalid or expired token' })
})
