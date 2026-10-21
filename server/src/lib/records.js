import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { clean } from './schema.js'

const MAX_RECORDS = 5000

// Create or update an imported record keyed by (user, ext). Only the fields in `synced` are
// overwritten on update, so notes/campaign/tags the user added are preserved.
export function upsertSynced(userId, ext, type, synced) {
  const row = db.prepare('SELECT id, data FROM records WHERE user_id = ? AND ext = ?').get(userId, ext)
  const { data, error } = clean(type, row ? { ...JSON.parse(row.data), ...synced } : synced)
  if (error) throw new Error(`Imported ${type} record was invalid: ${error}`)
  const now = new Date().toISOString()
  if (row) {
    db.prepare('UPDATE records SET data = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(data), now, row.id)
    return 'updated'
  }
  if (db.prepare('SELECT COUNT(*) AS n FROM records WHERE user_id = ?').get(userId).n >= MAX_RECORDS) throw new Error('Record limit reached.')
  db.prepare('INSERT INTO records (id, user_id, type, data, ext, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(randomUUID(), userId, type, JSON.stringify(data), ext, now, now)
  return 'created'
}
