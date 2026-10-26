import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { config } from '../config.js'
import { db } from '../db.js'
import { buildAggregates, generateSummary, hashInput } from '../lib/summary.js'
import { getWorkspace, logActivity } from '../lib/workspace.js'

const router = Router()
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const CACHE_MS = 60 * 60 * 1000

router.get('/summary', wrap(async (req, res) => {
  const row = await db.get('SELECT * FROM insight_summaries WHERE user_id = ?', req.user.id)
  res.json({ configured: !!config.anthropic.key, model: config.anthropic.model, summary: row ? JSON.parse(row.data) : null, createdAt: row?.created_at || null })
}))

// 10 generations per user per hour (each one is a paid API call).
const limiter = rateLimit({ windowMs: CACHE_MS, limit: 10, keyGenerator: (req) => req.user.id, standardHeaders: true, legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false }, message: { error: 'You have reached the hourly limit for AI summaries. Try again later.' } })

router.post('/summary', limiter, wrap(async (req, res) => {
  if (!config.anthropic.key) return res.status(501).json({ error: 'AI summaries are not set up. Add ANTHROPIC_API_KEY to server/.env and restart the server.' })
  const ws = await getWorkspace(req.user)
  if (!ws.collections.content.length && !ws.collections.revenue.length) return res.status(400).json({ error: 'Add some content or revenue first, then generate a summary.' })
  const agg = buildAggregates(ws, req.body?.includeTitles === true)
  const hash = hashInput(agg)
  const prev = await db.get('SELECT * FROM insight_summaries WHERE user_id = ?', req.user.id)
  if (prev && prev.input_hash === hash && Date.now() - Date.parse(prev.created_at) < CACHE_MS) {
    return res.json({ summary: JSON.parse(prev.data), createdAt: prev.created_at, model: prev.model, cached: true })
  }
  let out
  try { out = await generateSummary(agg) } catch (e) { return res.status(502).json({ error: e.message }) }
  const createdAt = new Date().toISOString()
  await db.run(`INSERT INTO insight_summaries (user_id, created_at, model, input_hash, data) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET created_at = excluded.created_at, model = excluded.model, input_hash = excluded.input_hash, data = excluded.data`,
    req.user.id, createdAt, out.model, hash, JSON.stringify(out.summary))
  await logActivity(req.user.id, 'Generated AI summary', out.model)
  res.json({ summary: out.summary, createdAt, model: out.model, cached: false })
}))

export default router
