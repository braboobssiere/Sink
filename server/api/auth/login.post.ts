import { defineEventHandler, readBody, createError, setCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import { storeSessionToken } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)
  const config = useRuntimeConfig()

  if (!username || !password) {
    throw createError({ statusCode: 400, message: 'Username and password required' })
  }

  if (username === config.adminUsername && password === config.adminPassword) {
    const sessionToken = crypto.randomUUID()
    await storeSessionToken(sessionToken, { admin: true, createdAt: Date.now() })

    // Set httpOnly cookie – automatically sent with every request
    setCookie(event, 'auth_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400, // 24 hour
    })

    return { success: true }
  }

  throw createError({ statusCode: 401, message: 'Invalid admin credentials' })
})
