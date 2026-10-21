import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { config } from './config.js'

mkdirSync(dirname(config.dbFile), { recursive: true })
export const db = new Database(config.dbFile)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Records are stored as validated JSON per type (content, revenue, links, ...).
// Every row is scoped to a user_id, and every query filters on it.
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_records_user_type ON records(user_id, type);
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id, created_at);
`)

// ── Step 2: tracking-link redirects ───────────────────────────────────────
// Public /r/:slug URLs have no logged-in user, so slugs live in their own indexed column
// and are unique across ALL users. Clicks are stored as events; the count is derived.
if (!db.prepare('PRAGMA table_info(records)').all().some((c) => c.name === 'slug')) db.exec('ALTER TABLE records ADD COLUMN slug TEXT')
db.exec(`
CREATE UNIQUE INDEX IF NOT EXISTS idx_records_slug ON records(slug);
CREATE TABLE IF NOT EXISTS link_clicks (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clicked_at TEXT NOT NULL,
  visitor TEXT NOT NULL,
  referrer TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_clicks_link ON link_clicks(link_id, clicked_at);
`)
// Backfill slugs for links created in step 1 (skips any that clash with another user's slug).
for (const r of db.prepare(`SELECT id, json_extract(data, '$.slug') AS s FROM records WHERE type = 'links' AND slug IS NULL`).all()) {
  const s = String(r.s || '').toLowerCase()
  if (s) { try { db.prepare('UPDATE records SET slug = ? WHERE id = ?').run(s, r.id) } catch { /* duplicate: user picks a new slug on next edit */ } }
}

// ── Steps 4–5: platform connections, feeds, AI summaries ──────────────────
// Records imported from a platform carry an external key in `ext` (e.g. youtube:video:ID) so
// re-syncing updates them instead of creating duplicates.
if (!db.prepare('PRAGMA table_info(records)').all().some((c) => c.name === 'ext')) db.exec('ALTER TABLE records ADD COLUMN ext TEXT')
db.exec(`
CREATE UNIQUE INDEX IF NOT EXISTS idx_records_ext ON records(user_id, ext);
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL DEFAULT '',
  account_name TEXT NOT NULL DEFAULT '',
  access_token TEXT NOT NULL,      -- AES-256-GCM encrypted
  refresh_token TEXT,              -- AES-256-GCM encrypted
  expires_at INTEGER NOT NULL DEFAULT 0,
  scopes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'connected',
  connected_at TEXT NOT NULL,
  last_sync_at TEXT,
  last_sync_note TEXT NOT NULL DEFAULT '',
  UNIQUE (user_id, provider)
);
CREATE TABLE IF NOT EXISTS oauth_states (
  state TEXT PRIMARY KEY, user_id TEXT NOT NULL, provider TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS feeds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  platform TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  last_sync_at TEXT,
  last_sync_note TEXT NOT NULL DEFAULT '',
  UNIQUE (user_id, url)
);
CREATE TABLE IF NOT EXISTS insight_summaries (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL, model TEXT NOT NULL, input_hash TEXT NOT NULL, data TEXT NOT NULL
);
`)
