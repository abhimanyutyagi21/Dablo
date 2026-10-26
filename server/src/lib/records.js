import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { clean } from './schema.js'

const MAX_RECORDS = 5000

// Create or update an imported record keyed by (user, ext). Only the fields in `synced` are
// overwritten on update, so notes/campaign/tags the user added are preserved.
// `x` is the optional transaction handle from db.tx().
export async function upsertSynced(userId, ext, type, synced, x = db) {
  const row = await x.get('SELECT id, data FROM records WHERE user_id = ? AND ext = ?', userId, ext)
  const { data, error } = clean(type, row ? { ...JSON.parse(row.data), ...synced } : synced)
  if (error) throw new Error(`Imported ${type} record was invalid: ${error}`)
  const now = new Date().toISOString()
  if (row) {
    await x.run('UPDATE records SET data = ?, updated_at = ? WHERE id = ?', JSON.stringify(data), now, row.id)
    return 'updated'
  }
  if ((await x.get('SELECT COUNT(*) AS n FROM records WHERE user_id = ?', userId)).n >= MAX_RECORDS) throw new Error('Record limit reached.')
  await x.run('INSERT INTO records (id, user_id, type, data, ext, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    randomUUID(), userId, type, JSON.stringify(data), ext, now, now)
  return 'created'
}
