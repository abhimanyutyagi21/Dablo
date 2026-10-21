import { Router } from 'express'
import { randomBytes, randomUUID } from 'node:crypto'
import { config } from '../config.js'
import { db } from '../db.js'
import { decrypt } from '../lib/crypto.js'
import { logActivity } from '../lib/workspace.js'
import { exchangeCode, providers, redirectUri, runSync, saveConnection } from '../integrations/oauth.js'
import { FEED_TYPES, refreshFeed } from '../integrations/rss.js'

const router = Router()
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const MAX_FEEDS = 10

const connectionInfo = (c) => c && {
  accountName: c.account_name, status: c.status, connectedAt: c.connected_at, lastSyncAt: c.last_sync_at, note: c.last_sync_note,
}
const feedInfo = (f) => ({ id: f.id, url: f.url, platform: f.platform, title: f.title, lastSyncAt: f.last_sync_at, note: f.last_sync_note })
const getConn = (userId, provider) => db.prepare('SELECT * FROM integrations WHERE user_id = ? AND provider = ?').get(userId, provider)

// Tokens never leave the server: this only returns names, status and sync notes.
router.get('/', (req, res) => {
  res.json({
    providers: Object.values(providers).map((p) => ({
      id: p.id, label: p.label, configured: p.configured(), setupHint: `Add ${p.envHint} to server/.env, then restart the server.`,
      connection: connectionInfo(getConn(req.user.id, p.id)) || null,
    })),
    feeds: db.prepare('SELECT * FROM feeds WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id).map(feedInfo),
  })
})

// ── RSS / Atom feeds (blogs, newsletters, podcasts) ────────────────────────
router.post('/feeds', wrap(async (req, res) => {
  const url = String(req.body?.url ?? '').trim()
  const platform = String(req.body?.platform ?? '')
  if (!FEED_TYPES.includes(platform)) return res.status(400).json({ error: `Type must be one of: ${FEED_TYPES.join(', ')}.` })
  try { if (!['http:', 'https:'].includes(new URL(url).protocol) || url.length > 500) throw new Error('bad') }
  catch { return res.status(400).json({ error: 'Enter a valid http or https feed URL.' }) }
  const { id: userId } = req.user
  if (db.prepare('SELECT COUNT(*) AS n FROM feeds WHERE user_id = ?').get(userId).n >= MAX_FEEDS) return res.status(400).json({ error: `You can add up to ${MAX_FEEDS} feeds.` })
  if (db.prepare('SELECT 1 FROM feeds WHERE user_id = ? AND url = ?').get(userId, url)) return res.status(409).json({ error: 'You already added this feed.' })
  const id = randomUUID()
  db.prepare('INSERT INTO feeds (id, user_id, url, platform, created_at) VALUES (?, ?, ?, ?, ?)').run(id, userId, url, platform, new Date().toISOString())
  try {
    const note = await refreshFeed(db.prepare('SELECT * FROM feeds WHERE id = ?').get(id))
    logActivity(userId, `Added ${platform.toLowerCase()} feed`, note)
    res.status(201).json({ feed: feedInfo(db.prepare('SELECT * FROM feeds WHERE id = ?').get(id)), note })
  } catch (e) {
    db.prepare('DELETE FROM feeds WHERE id = ?').run(id) // don't keep feeds that can't be read
    res.status(400).json({ error: e.message })
  }
}))

router.post('/feeds/:id/sync', wrap(async (req, res) => {
  const feed = db.prepare('SELECT * FROM feeds WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!feed) return res.status(404).json({ error: 'Feed not found.' })
  try { res.json({ note: await refreshFeed(feed) }) } catch (e) { res.status(502).json({ error: e.message }) }
}))

router.delete('/feeds/:id', (req, res) => {
  const r = db.prepare('DELETE FROM feeds WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  if (!r.changes) return res.status(404).json({ error: 'Feed not found.' })
  res.json({ id: req.params.id }) // imported items stay in your content library
})

// ── OAuth platforms (YouTube, Twitch) ─────────────────────────────────────
const provider = (req, res, next) => {
  const p = providers[req.params.provider]
  if (!p) return res.status(404).json({ error: 'Unknown platform.' })
  req.provider = p
  next()
}

router.get('/:provider/connect', provider, (req, res) => {
  const p = req.provider
  if (!p.configured()) return res.status(400).json({ error: `${p.label} is not set up on the server. Add ${p.envHint} to server/.env.` })
  const state = randomBytes(24).toString('hex')
  db.prepare('DELETE FROM oauth_states WHERE created_at < ?').run(Date.now() - 10 * 60 * 1000)
  db.prepare('INSERT INTO oauth_states (state, user_id, provider, created_at) VALUES (?, ?, ?, ?)').run(state, req.user.id, p.id, Date.now())
  res.json({ url: p.authorize(state, redirectUri(p.id)) })
})

// Google/Twitch send the browser back here. The state must match one we issued to this signed-in user (CSRF protection).
router.get('/:provider/callback', provider, wrap(async (req, res) => {
  const p = req.provider
  const back = (q) => res.redirect(`${config.publicUrl}/app/platforms?${new URLSearchParams(q)}`)
  const { code, state, error } = req.query
  if (error) return back({ error: error === 'access_denied' ? 'You cancelled the connection.' : 'The platform refused the connection.' })
  const row = db.prepare('SELECT * FROM oauth_states WHERE state = ? AND user_id = ? AND provider = ?').get(String(state || ''), req.user.id, p.id)
  db.prepare('DELETE FROM oauth_states WHERE state = ?').run(String(state || ''))
  if (!row || Date.now() - row.created_at > 10 * 60 * 1000 || !code) return back({ error: 'That connection link expired. Please try again.' })
  try {
    const tokens = await exchangeCode(p, String(code))
    const account = await p.fetchAccount(tokens.access_token)
    const conn = saveConnection(req.user.id, p, account, tokens)
    logActivity(req.user.id, `Connected ${p.label}`, account.name)
    try { await runSync(conn) } catch { /* connection is saved; the card shows the sync error */ }
    back({ connected: p.id })
  } catch (e) { back({ error: `Could not connect ${p.label}: ${e.message}` }) }
}))

router.post('/:provider/sync', provider, wrap(async (req, res) => {
  const conn = getConn(req.user.id, req.provider.id)
  if (!conn) return res.status(404).json({ error: `${req.provider.label} is not connected.` })
  try { res.json({ note: await runSync(conn) }) } catch (e) { res.status(502).json({ error: e.message }) }
}))

router.delete('/:provider', provider, wrap(async (req, res) => {
  const p = req.provider
  const conn = getConn(req.user.id, p.id)
  if (!conn) return res.status(404).json({ error: `${p.label} is not connected.` })
  try { await p.revoke(decrypt(conn.access_token)) } catch { /* best effort */ }
  db.prepare('DELETE FROM integrations WHERE id = ?').run(conn.id)
  logActivity(req.user.id, `Disconnected ${p.label}`, 'Imported records were kept')
  res.json({ ok: true })
}))

export default router
