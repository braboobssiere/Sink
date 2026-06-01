import { defineEventHandler, readBody, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { storeSessionToken } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)
  const config = useRuntimeConfig()

  if (!username || !password) {
    throw createError({ statusCode: 400, message: 'Username and password required' })
  }

  if (username === config.adminUsername && password === config.adminPassword) {
    // Generate a secure random token
    const sessionToken = crypto.randomUUID()
    await storeSessionToken(sessionToken, { admin: true, createdAt: Date.now() })

    // Return the session token – the frontend will store it
    return { token: sessionToken }
  }

  throw createError({ statusCode: 401, message: 'Invalid admin credentials' })
})
