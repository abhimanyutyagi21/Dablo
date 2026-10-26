import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { TYPES } from './schema.js'

// Every function that touches the database is async. The optional last argument `x` lets a caller
// pass the transaction handle from db.tx() so the work happens inside that transaction.

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
export const clickCount = async (linkId, x = db) => (await x.get('SELECT COUNT(*) AS n FROM link_clicks WHERE link_id = ?', linkId)).n
export const loadRecord = async (id, x = db) => {
  const row = await x.get('SELECT * FROM records WHERE id = ?', id)
  return toRecord(row, row.type === 'links' ? await clickCount(id, x) : 0)
}

export async function getSettings(user, x = db) {
  const row = await x.get('SELECT data FROM settings WHERE user_id = ?', user.id)
  return { ...defaultSettings(), ...(row ? JSON.parse(row.data) : {}), email: user.email }
}

export async function saveSettings(userId, settings, x = db) {
  const { email, ...rest } = settings // email lives on the users table
  await x.run('INSERT INTO settings (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data',
    userId, JSON.stringify(rest))
}

export const getActivities = (userId, x = db) => x.all(
  'SELECT id, text, detail, created_at AS date FROM activities WHERE user_id = ? ORDER BY created_at DESC, seq DESC LIMIT 30', userId)

export async function logActivity(userId, text, detail = '', x = db) {
  await x.run('INSERT INTO activities (id, user_id, text, detail, created_at) VALUES (?, ?, ?, ?, ?)',
    randomUUID(), userId, text, String(detail).slice(0, 200), new Date().toISOString())
  await x.run(`DELETE FROM activities WHERE user_id = ? AND id NOT IN
    (SELECT id FROM activities WHERE user_id = ? ORDER BY created_at DESC, seq DESC LIMIT 30)`, userId, userId)
}

// Everything the client needs after login / on page load.
export async function getWorkspace(user, x = db) {
  const collections = Object.fromEntries(Object.keys(TYPES).map((t) => [t, []]))
  const rows = await x.all('SELECT * FROM records WHERE user_id = ? ORDER BY created_at DESC, seq DESC', user.id)
  const clickRows = await x.all('SELECT link_id, COUNT(*) AS n FROM link_clicks WHERE user_id = ? GROUP BY link_id', user.id)
  const clicks = Object.fromEntries(clickRows.map((r) => [r.link_id, r.n]))
  for (const row of rows) collections[row.type]?.push(toRecord(row, clicks[row.id] || 0))
  return { user: { id: user.id, email: user.email }, settings: await getSettings(user, x), collections, activities: await getActivities(user.id, x) }
}
