import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { endSession, startSession } from '../lib/session.js'
import { defaultSettings, getWorkspace, saveSettings } from '../lib/workspace.js'

const router = Router()
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12)

router.post('/signup', wrap(async (req, res) => {
  const name = String(req.body?.name ?? '').trim()
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')
  if (!name || name.length > 80) return res.status(400).json({ error: 'Enter your name (80 characters max).' })
  if (!EMAIL.test(email) || email.length > 254) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (password.length < 8 || password.length > 200) return res.status(400).json({ error: 'Password must be 8–200 characters.' })
  if (await db.get('SELECT 1 FROM users WHERE email = ?', email)) return res.status(409).json({ error: 'An account with this email already exists. Try signing in.' })

  const id = randomUUID()
  const hash = await bcrypt.hash(password, 12)
  try {
    await db.tx(async (t) => {
      await t.run('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)', id, email, hash, new Date().toISOString())
      await saveSettings(id, { ...defaultSettings(), name, workspace: `${name.split(' ')[0]}'s workspace` }, t)
    })
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'An account with this email already exists. Try signing in.' })
    throw e
  }
  startSession(res, id)
  res.status(201).json(await getWorkspace({ id, email }))
}))

router.post('/login', wrap(async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')
  const user = await db.get('SELECT id, email, password_hash FROM users WHERE email = ?', email)
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)
  if (!user || !ok) return res.status(401).json({ error: 'Incorrect email or password.' })
  startSession(res, user.id)
  res.json(await getWorkspace(user))
}))

router.post('/logout', (req, res) => { endSession(res); res.json({ ok: true }) })

export default router
