import { Router } from 'express'
import { createHash, randomUUID } from 'node:crypto'
import { config } from '../config.js'
import { db } from '../db.js'

const router = Router()

// Link unfurlers, crawlers and CLI tools shouldn't inflate "qualified clicks".
const BOT = /bot|crawl|spider|slurp|preview|unfurl|facebookexternalhit|whatsapp|telegram|discord|slack|curl|wget|python-requests|httpclient|headless|monitor|lighthouse/i
const DEDUPE_MS = 30 * 1000 // same visitor + same link within 30s counts once (double-clicks, refreshes)
const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function page(res, status, title, text) {
  res.status(status).type('html').send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f8f7f2;color:#1b2115">
<main style="text-align:center;padding:24px"><h1 style="font-size:22px;margin:0 0 8px">${title}</h1><p style="margin:0;color:#5c6455">${text}</p></main>`)
}

function shouldCount(req) {
  const ua = req.get('user-agent') || ''
  if (req.method !== 'GET' || !ua || BOT.test(ua)) return false
  const purpose = `${req.get('purpose') || ''}${req.get('sec-purpose') || ''}${req.get('x-moz') || ''}`.toLowerCase()
  return !purpose.includes('prefetch') && !purpose.includes('prerender')
}

// Visitors are stored only as a short salted hash that rotates daily — no raw IPs.
function recordClick(req, link) {
  const ua = req.get('user-agent') || ''
  const day = new Date().toISOString().slice(0, 10)
  const visitor = createHash('sha256').update(`${config.jwtSecret}|${day}|${req.ip}|${ua}`).digest('hex').slice(0, 16)
  const recent = db.prepare('SELECT 1 FROM link_clicks WHERE link_id = ? AND visitor = ? AND clicked_at > ?')
    .get(link.id, visitor, new Date(Date.now() - DEDUPE_MS).toISOString())
  if (recent) return
  let referrer = ''
  try { referrer = new URL(req.get('referer') || '').hostname.slice(0, 100) } catch { /* no referrer */ }
  db.prepare('INSERT INTO link_clicks (id, link_id, user_id, clicked_at, visitor, referrer) VALUES (?, ?, ?, ?, ?, ?)')
    .run(randomUUID(), link.id, link.user_id, new Date().toISOString(), visitor, referrer)
}

router.get('/:slug', (req, res) => {
  res.set('Cache-Control', 'no-store') // 302 + no-store so every click reaches the server
  const row = db.prepare(`SELECT id, user_id, data FROM records WHERE type = 'links' AND slug = ?`).get(String(req.params.slug).toLowerCase())
  if (!row) return page(res, 404, 'Link not found', 'This link does not exist or was removed.')
  const link = JSON.parse(row.data)
  if (link.status !== 'Active') return page(res, 410, 'Link paused', 'The owner has paused this link.')

  let target
  try {
    target = new URL(link.destination)
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('bad protocol')
  } catch { return page(res, 404, 'Link not found', 'This link has an invalid destination.') }

  // Add campaign parameters without overriding any the destination already has.
  for (const [k, v] of [['utm_source', link.source], ['utm_medium', link.medium], ['utm_campaign', slugify(link.campaign)]]) {
    if (v && !target.searchParams.has(k)) target.searchParams.set(k, v)
  }
  try { if (shouldCount(req)) recordClick(req, { id: row.id, user_id: row.user_id }) }
  catch (e) { console.error('click logging failed', e) } // never block the visitor
  res.redirect(302, target.href)
})

export default router
