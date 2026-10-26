import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { clean, TYPES } from '../lib/schema.js'
import { SUPPORTED } from '../lib/rates.js'
import { getActivities, getSettings, logActivity, toRecord } from '../lib/workspace.js'

// Bulk import of rows parsed from a CSV in the browser. Every row is re-validated here with the same
// rules as the normal "add record" form, and rows that already exist are skipped (no double imports).
const router = Router()
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const MAX_ROWS = 1000
const MAX_RECORDS = 5000
const BATCH = 200
const IMPORTABLE = ['content', 'revenue', 'campaigns', 'products']

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Facebook', 'X', 'LinkedIn', 'Twitch', 'Newsletter', 'Blog', 'Podcast', 'Other']
// Free-text or enum fields that the CSV may spell differently (case, spacing). value -> allowed spellings
const ENUMS = {
  content: { platform: PLATFORMS },
  revenue: { platform: ['Unassigned', ...PLATFORMS], source: ['Affiliate', 'Sponsorship', 'Digital product', 'Services', 'Platform payout', 'Other'],
    attribution: ['Attributed', 'Manually associated', 'Unattributed', 'Estimated'] },
  campaigns: { status: ['Planning', 'Active', 'Completed', 'Archived'] },
  products: { status: ['Active', 'Draft', 'Archived'] },
}
const DEFAULTS = {
  content: { platform: 'Other' },
  revenue: { source: 'Other', attribution: 'Unattributed', platform: '' },
  campaigns: { status: 'Planning' },
  products: { status: 'Active', type: 'Other' },
}
const norm = (v) => String(v ?? '').trim().toLowerCase()
const KEY = {
  content: (d) => [d.title, d.platform, d.published].map(norm).join('|'),
  revenue: (d) => (norm(d.reference) ? `ref:${norm(d.reference)}` : [d.title, d.amount, d.currency, d.date].map(norm).join('|')),
  campaigns: (d) => norm(d.name),
  products: (d) => norm(d.name),
}

function normalise(type, row, home) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return { error: 'Row is not valid.' }
  const out = { ...row }
  for (const [key, options] of Object.entries(ENUMS[type] || {})) {
    const hit = options.find((o) => o.toLowerCase() === norm(out[key]))
    out[key] = hit || DEFAULTS[type]?.[key] || ''
  }
  if (type === 'products' && !String(out.type ?? '').trim()) out.type = 'Other'
  const given = String(out.currency ?? '').trim().toUpperCase()
  if (given && !SUPPORTED.includes(given)) return { error: `Unsupported currency ${given}.` }
  out.currency = given || home
  return { row: out }
}

router.post('/:type', wrap(async (req, res) => {
  const { type } = req.params
  if (!IMPORTABLE.includes(type)) return res.status(404).json({ error: 'This record type cannot be imported.' })
  const rows = req.body?.rows
  if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ error: 'There are no rows to import.' })
  if (rows.length > MAX_ROWS) return res.status(400).json({ error: `Import up to ${MAX_ROWS} rows at a time.` })

  const { id: userId } = req.user
  const home = (await getSettings(req.user)).currency
  const existing = await db.all('SELECT data FROM records WHERE user_id = ? AND type = ?', userId, type)
  const seen = new Set(existing.map((r) => KEY[type](JSON.parse(r.data))))
  const total = (await db.get('SELECT COUNT(*) AS n FROM records WHERE user_id = ?', userId)).n

  const good = [], errors = []
  let duplicates = 0
  rows.forEach((raw, i) => {
    const n = normalise(type, raw, home)
    if (n.error) { errors.push({ row: i + 1, error: n.error }); return }
    const { data, error } = clean(type, n.row)
    if (error) { errors.push({ row: i + 1, error }); return }
    const key = KEY[type](data)
    if (seen.has(key)) { duplicates++; return }
    seen.add(key)
    good.push(data)
  })
  if (total + good.length > MAX_RECORDS) return res.status(400).json({ error: `Record limit reached (${MAX_RECORDS}). You can import ${Math.max(0, MAX_RECORDS - total)} more.` })

  const now = new Date().toISOString()
  await db.tx(async (t) => {
    for (let i = 0; i < good.length; i += BATCH) {
      const chunk = good.slice(i, i + BATCH)
      const marks = chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')
      const params = chunk.flatMap((d) => [randomUUID(), userId, type, JSON.stringify(d), now, now])
      await t.run(`INSERT INTO records (id, user_id, type, data, created_at, updated_at) VALUES ${marks}`, ...params)
    }
  })
  if (good.length) await logActivity(userId, `Imported ${good.length} ${TYPES[type].singular}${good.length === 1 ? '' : 's'} from CSV`, duplicates ? `${duplicates} duplicate(s) skipped` : '')

  const records = (await db.all('SELECT * FROM records WHERE user_id = ? AND type = ? ORDER BY created_at DESC, seq DESC', userId, type)).map((r) => toRecord(r))
  res.json({ created: good.length, duplicates, invalid: errors.length, errors: errors.slice(0, 20), records, activities: await getActivities(userId) })
}))

export default router
