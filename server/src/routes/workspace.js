import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { clean, cleanSettings, TYPES } from '../lib/schema.js'
import { getActivities, getSettings, getWorkspace, loadRecord, logActivity, saveSettings } from '../lib/workspace.js'

const router = Router()
const MAX_RECORDS = 5000
const SLUG = /^[a-z0-9][a-z0-9_-]{0,69}$/
const SLUG_TAKEN = 'That slug is already taken. Try a different one.'
const label = (d) => d.title || d.name || d.destination || d.amount || 'Record saved'
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)

router.get('/workspace', (req, res) => res.json(getWorkspace(req.user)))

// Wipe all records + activity (click events cascade); keep the account and basic profile.
router.delete('/workspace', (req, res) => {
  const { id } = req.user
  db.transaction(() => {
    db.prepare('DELETE FROM records WHERE user_id = ?').run(id)
    db.prepare('DELETE FROM activities WHERE user_id = ?').run(id)
    const s = getSettings(req.user)
    saveSettings(id, { name: s.name || 'Creator', workspace: 'My workspace', currency: 'USD', onboardingComplete: true,
      creatorType: '', niche: '', primaryGoal: '', audienceSize: '', revenueStreams: [], platforms: [] })
  })()
  res.json(getWorkspace(req.user))
})

router.patch('/settings', (req, res) => {
  const { data, email, error } = cleanSettings(req.body)
  if (error) return res.status(400).json({ error })
  const { id } = req.user
  if (email && email !== req.user.email) {
    if (db.prepare('SELECT 1 FROM users WHERE email = ? AND id != ?').get(email, id)) return res.status(409).json({ error: 'That email is already in use.' })
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, id)
    req.user.email = email
  }
  const onboarding = data.onboardingComplete === true && !getSettings(req.user).onboardingComplete
  saveSettings(id, { ...getSettings(req.user), ...data })
  logActivity(id, onboarding ? 'Completed workspace onboarding' : 'Updated workspace settings', onboarding ? 'Initial creator profile and preferences saved' : '')
  res.json({ settings: getSettings(req.user), activities: getActivities(id) })
})

function validate(req, res) {
  const { type } = req.params
  if (!TYPES[type]) { res.status(404).json({ error: 'Unknown record type.' }); return null }
  const { data, error } = clean(type, req.body)
  if (error) { res.status(400).json({ error }); return null }
  // Slugs become public /r/:slug URLs, so they are unique across ALL users. Empty slug = auto-generate.
  if (type === 'links') {
    data.slug = (data.slug || `${slugify(data.name) || 'link'}-${randomUUID().slice(0, 4)}`).toLowerCase()
    if (!SLUG.test(data.slug)) { res.status(400).json({ error: 'Slug can only use letters, numbers, hyphens and underscores (max 70).' }); return null }
    if (db.prepare('SELECT 1 FROM records WHERE slug = ? AND id != ?').get(data.slug, req.params.id || '')) { res.status(409).json({ error: SLUG_TAKEN }); return null }
  }
  return data
}

const isDuplicateSlug = (e) => e.code === 'SQLITE_CONSTRAINT_UNIQUE'

router.post('/records/:type', (req, res) => {
  const data = validate(req, res)
  if (!data) return
  const { id: userId } = req.user
  if (db.prepare('SELECT COUNT(*) AS n FROM records WHERE user_id = ?').get(userId).n >= MAX_RECORDS) return res.status(400).json({ error: 'Record limit reached.' })
  const id = randomUUID(), now = new Date().toISOString()
  try {
    db.prepare('INSERT INTO records (id, user_id, type, data, slug, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, userId, req.params.type, JSON.stringify(data), data.slug || null, now, now)
  } catch (e) { if (isDuplicateSlug(e)) return res.status(409).json({ error: SLUG_TAKEN }); throw e }
  logActivity(userId, `Created ${TYPES[req.params.type].singular}`, label(data))
  res.status(201).json({ record: loadRecord(id), activities: getActivities(userId) })
})

router.patch('/records/:type/:id', (req, res) => {
  const { type, id } = req.params
  const row = TYPES[type] && db.prepare('SELECT id FROM records WHERE id = ? AND user_id = ? AND type = ?').get(id, req.user.id, type)
  if (!row) return res.status(404).json({ error: 'This record no longer exists.' })
  const data = validate(req, res)
  if (!data) return
  try {
    db.prepare('UPDATE records SET data = ?, slug = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(data), data.slug || null, new Date().toISOString(), id)
  } catch (e) { if (isDuplicateSlug(e)) return res.status(409).json({ error: SLUG_TAKEN }); throw e }
  logActivity(req.user.id, `Updated ${TYPES[type].singular}`, label(data))
  res.json({ record: loadRecord(id), activities: getActivities(req.user.id) })
})

router.delete('/records/:type/:id', (req, res) => {
  const { type, id } = req.params
  const row = TYPES[type] && db.prepare('SELECT * FROM records WHERE id = ? AND user_id = ? AND type = ?').get(id, req.user.id, type)
  if (!row) return res.status(404).json({ error: 'This record no longer exists.' })
  db.prepare('DELETE FROM records WHERE id = ?').run(id)
  logActivity(req.user.id, `Deleted ${TYPES[type].singular}`, label(JSON.parse(row.data)))
  res.json({ id, activities: getActivities(req.user.id) })
})

export default router
