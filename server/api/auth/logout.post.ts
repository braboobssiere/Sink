import { eventHandler, getCookie, deleteCookie, createError } from 'h3'
import { verifySessionToken } from '~/server/utils/session'

export default eventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (token) {
    const session = await verifySessionToken(token)
    if (session) {
      await KV.delete(`session:${token}`)
    }
    deleteCookie(event, 'auth_token')
  }
  return { success: true }
})
