import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { db } from '../db.js'

export const COOKIE = 'dablo_session'
const opts = { httpOnly: true, sameSite: 'lax', secure: config.prod, path: '/' }

export function startSession(res, userId) {
  const token = jwt.sign({ sub: userId }, config.jwtSecret, { algorithm: 'HS256', expiresIn: '7d' })
  res.cookie(COOKIE, token, { ...opts, maxAge: 7 * 24 * 3600 * 1000 })
}
export const endSession = (res) => res.clearCookie(COOKIE, opts)

export async function requireAuth(req, res, next) {
  try {
    const { sub } = jwt.verify(req.cookies[COOKIE] || '', config.jwtSecret, { algorithms: ['HS256'] })
    const user = await db.get('SELECT id, email FROM users WHERE id = ?', sub)
    if (!user) throw new Error('no user')
    req.user = user
  } catch {
    return res.status(401).json({ error: 'Not signed in.' })
  }
  next()
}
