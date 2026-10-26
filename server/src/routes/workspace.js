import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { db } from '../db.js'
import { clean, cleanSettings, TYPES } from '../lib/schema.js'
import { getActivities, getSettings, getWorkspace, loadRecord, logActivity, saveSettings } from '../lib/workspace.js'

const router = Router()
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const MAX_RECORDS = 5000
const SLUG = /^[a-z0-9][a-z0-9_-]{0,69}$/
const SLUG_TAKEN = 'That slug is already taken. Try a different one.'
const label = (d) => d.title || d.name || d.destination || d.amount || 'Record saved'
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)

router.get('/workspace', wrap(async (req, res) => res.json(await getWorkspace(req.user))))

// Wipe all records + activity (click events cascade); keep the account and basic profile.
router.delete('/workspace', wrap(async (req, res) => {
  const { id } = req.user
  await db.tx(async (t) => {
    await t.run('DELETE FROM records WHERE user_id = ?', id)
    await t.run('DELETE FROM activities WHERE user_id = ?', id)
    const s = await getSettings(req.user, t)
    await saveSettings(id, { name: s.name || 'Creator', workspace: 'My workspace', currency: 'USD', onboardingComplete: true,
      creatorType: '', niche: '', primaryGoal: '', audienceSize: '', revenueStreams: [], platforms: [] }, t)
  })
  res.json(await getWorkspace(req.user))
}))

router.patch('/settings', wrap(async (req, res) => {
  const { data, email, error } = cleanSettings(req.body)
  if (error) return res.status(400).json({ error })
  const { id } = req.user
  if (email && email !== req.user.email) {
    if (await db.get('SELECT 1 FROM users WHERE email = ? AND id != ?', email, id)) return res.status(409).json({ error: 'That email is already in use.' })
    await db.run('UPDATE users SET email = ? WHERE id = ?', email, id)
    req.user.email = email
  }
  const current = await getSettings(req.user)
  const onboarding = data.onboardingComplete === true && !current.onboardingComplete
  await saveSettings(id, { ...current, ...data })
  await logActivity(id, onboarding ? 'Completed workspace onboarding' : 'Updated workspace settings', onboarding ? 'Initial creator profile and preferences saved' : '')
  res.json({ settings: await getSettings(req.user), activities: await getActivities(id) })
}))

async function validate(req, res) {
  const { type } = req.params
  if (!TYPES[type]) { res.status(404).json({ error: 'Unknown record type.' }); return null }
  const { data, error } = clean(type, req.body)
  if (error) { res.status(400).json({ error }); return null }
  // Slugs become public /r/:slug URLs, so they are unique across ALL users. Empty slug = auto-generate.
  if (type === 'links') {
    data.slug = (data.slug || `${slugify(data.name) || 'link'}-${randomUUID().slice(0, 4)}`).toLowerCase()
    if (!SLUG.test(data.slug)) { res.status(400).json({ error: 'Slug can only use letters, numbers, hyphens and underscores (max 70).' }); return null }
    if (await db.get('SELECT 1 FROM records WHERE slug = ? AND id != ?', data.slug, req.params.id || '')) { res.status(409).json({ error: SLUG_TAKEN }); return null }
  }
  return data
}

const isDuplicateSlug = (e) => e.code === '23505' // Postgres unique_violation

router.post('/records/:type', wrap(async (req, res) => {
  const data = await validate(req, res)
  if (!data) return
  const { id: userId } = req.user
  if ((await db.get('SELECT COUNT(*) AS n FROM records WHERE user_id = ?', userId)).n >= MAX_RECORDS) return res.status(400).json({ error: 'Record limit reached.' })
  const id = randomUUID(), now = new Date().toISOString()
  try {
    await db.run('INSERT INTO records (id, user_id, type, data, slug, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      id, userId, req.params.type, JSON.stringify(data), data.slug || null, now, now)
  } catch (e) { if (isDuplicateSlug(e)) return res.status(409).json({ error: SLUG_TAKEN }); throw e }
  await logActivity(userId, `Created ${TYPES[req.params.type].singular}`, label(data))
  res.status(201).json({ record: await loadRecord(id), activities: await getActivities(userId) })
}))

router.patch('/records/:type/:id', wrap(async (req, res) => {
  const { type, id } = req.params
  const row = TYPES[type] && await db.get('SELECT id FROM records WHERE id = ? AND user_id = ? AND type = ?', id, req.user.id, type)
  if (!row) return res.status(404).json({ error: 'This record no longer exists.' })
  const data = await validate(req, res)
  if (!data) return
  try {
    await db.run('UPDATE records SET data = ?, slug = ?, updated_at = ? WHERE id = ?', JSON.stringify(data), data.slug || null, new Date().toISOString(), id)
  } catch (e) { if (isDuplicateSlug(e)) return res.status(409).json({ error: SLUG_TAKEN }); throw e }
  await logActivity(req.user.id, `Updated ${TYPES[type].singular}`, label(data))
  res.json({ record: await loadRecord(id), activities: await getActivities(req.user.id) })
}))

router.delete('/records/:type/:id', wrap(async (req, res) => {
  const { type, id } = req.params
  const row = TYPES[type] && await db.get('SELECT * FROM records WHERE id = ? AND user_id = ? AND type = ?', id, req.user.id, type)
  if (!row) return res.status(404).json({ error: 'This record no longer exists.' })
  await db.run('DELETE FROM records WHERE id = ?', id)
  await logActivity(req.user.id, `Deleted ${TYPES[type].singular}`, label(JSON.parse(row.data)))
  res.json({ id, activities: await getActivities(req.user.id) })
}))

export default router
