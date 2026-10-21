import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { TYPES } from './schema.js'

export const defaultSettings = () => ({
  name: '', workspace: 'My workspace', currency: 'INR', creatorType: '', niche: '', primaryGoal: '', audienceSize: '',
  revenueStreams: [], platforms: [], onboardingComplete: false,
})

export const toRecord = (row, tracked = 0) => {
  const rec = { ...JSON.parse(row.data), id: row.id, createdAt: row.created_at }
  if (row.type === 'links') rec.clicks = tracked // link clicks are counted by the /r/:slug redirect
  if (row.ext) rec.synced = row.ext.split(':')[0] // youtube | twitch | rss
  return rec
}
export const clickCount = (linkId) => db.prepare('SELECT COUNT(*) AS n FROM link_clicks WHERE link_id = ?').get(linkId).n
export const loadRecord = (id) => {
  const row = db.prepare('SELECT * FROM records WHERE id = ?').get(id)
  return toRecord(row, row.type === 'links' ? clickCount(id) : 0)
}

export function getSettings(user) {
  const row = db.prepare('SELECT data FROM settings WHERE user_id = ?').get(user.id)
  return { ...defaultSettings(), ...(row ? JSON.parse(row.data) : {}), email: user.email }
}

export function saveSettings(userId, settings) {
  const { email, ...rest } = settings // email lives on the users table
  db.prepare('INSERT INTO settings (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data')
    .run(userId, JSON.stringify(rest))
}

export const getActivities = (userId) => db.prepare(
  'SELECT id, text, detail, created_at AS date FROM activities WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 30').all(userId)

export function logActivity(userId, text, detail = '') {
  db.prepare('INSERT INTO activities (id, user_id, text, detail, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(randomUUID(), userId, text, String(detail).slice(0, 200), new Date().toISOString())
  db.prepare(`DELETE FROM activities WHERE user_id = ? AND id NOT IN
    (SELECT id FROM activities WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 30)`).run(userId, userId)
}

// Everything the client needs after login / on page load.
export function getWorkspace(user) {
  const collections = Object.fromEntries(Object.keys(TYPES).map((t) => [t, []]))
  const rows = db.prepare('SELECT * FROM records WHERE user_id = ? ORDER BY created_at DESC, rowid DESC').all(user.id)
  const clicks = Object.fromEntries(db.prepare('SELECT link_id, COUNT(*) AS n FROM link_clicks WHERE user_id = ? GROUP BY link_id').all(user.id).map((r) => [r.link_id, r.n]))
  for (const row of rows) collections[row.type]?.push(toRecord(row, clicks[row.id] || 0))
  return { user: { id: user.id, email: user.email }, settings: getSettings(user), collections, activities: getActivities(user.id) }
}
