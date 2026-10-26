import pg from 'pg'
import { config } from './config.js'

// Dablo stores everything in Postgres so accounts, passwords (hashed) and data survive restarts and deploys.
if (!config.databaseUrl) {
  console.error('DATABASE_URL is not set. Add your Postgres connection string (for example from neon.tech or supabase.com) to server/.env or to your host\'s environment variables.')
  process.exit(1)
}

pg.types.setTypeParser(20, (v) => Number(v)) // BIGINT and COUNT(*) come back as JS numbers

// We set SSL ourselves, so drop the SSL hints from the URL (they would override our setting).
const url = new URL(config.databaseUrl)
url.searchParams.delete('sslmode')
url.searchParams.delete('channel_binding')
const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)

const pool = new pg.Pool({
  connectionString: url.toString(),
  ssl: local || !config.dbSsl ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 10_000, // free hosted databases sleep when idle, so don't hold stale connections
  connectionTimeoutMillis: 15_000,
})
pool.on('error', (e) => console.error('[db] idle connection error:', e.message))

// The code below was written with "?" placeholders; Postgres wants $1, $2, ...
const toPg = (sql) => { let n = 0; return sql.replace(/\?/g, () => `$${++n}`) }
const retryable = (e) => /Connection terminated|ECONNRESET|ETIMEDOUT/i.test(e?.message || '') || ['ECONNRESET', '57P01'].includes(e?.code)

const executor = (c, canRetry) => {
  const query = async (sql, params) => {
    try { return await c.query(toPg(sql), params) }
    catch (e) { if (canRetry && retryable(e)) return c.query(toPg(sql), params); throw e }
  }
  return {
    all: async (sql, ...params) => (await query(sql, params)).rows,
    get: async (sql, ...params) => (await query(sql, params)).rows[0],
    run: async (sql, ...params) => ({ changes: (await query(sql, params)).rowCount }),
  }
}

export const db = {
  ...executor(pool, true),
  // Run several statements as one all-or-nothing unit: await db.tx(async (t) => { await t.run(...) })
  async tx(fn) {
    const c = await pool.connect()
    try {
      await c.query('BEGIN')
      const out = await fn(executor(c, false))
      await c.query('COMMIT')
      return out
    } catch (e) {
      try { await c.query('ROLLBACK') } catch { /* connection already gone */ }
      throw e
    } finally { c.release() }
  },
  exec: (sql) => pool.query(sql),
  close: () => pool.end(),
}

// Records are stored as validated JSON per type (content, revenue, links, ...).
// Every row is scoped to a user_id, and every query filters on it.
// `seq` keeps insertion order for rows created in the same millisecond.
await db.exec(`
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
  seq BIGSERIAL,
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data TEXT NOT NULL,
  slug TEXT,
  ext TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_records_user_type ON records(user_id, type);
-- Public /r/:slug URLs have no logged-in user, so slugs are unique across ALL users.
CREATE UNIQUE INDEX IF NOT EXISTS idx_records_slug ON records(slug);
-- Imported records carry an external key (e.g. youtube:video:ID) so re-syncing updates instead of duplicating.
CREATE UNIQUE INDEX IF NOT EXISTS idx_records_ext ON records(user_id, ext);
CREATE TABLE IF NOT EXISTS activities (
  seq BIGSERIAL,
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id, created_at);
CREATE TABLE IF NOT EXISTS link_clicks (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clicked_at TEXT NOT NULL,
  visitor TEXT NOT NULL,
  referrer TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_clicks_link ON link_clicks(link_id, clicked_at);
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL DEFAULT '',
  account_name TEXT NOT NULL DEFAULT '',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT NOT NULL DEFAULT 0,
  scopes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'connected',
  connected_at TEXT NOT NULL,
  last_sync_at TEXT,
  last_sync_note TEXT NOT NULL DEFAULT '',
  UNIQUE (user_id, provider)
);
CREATE TABLE IF NOT EXISTS oauth_states (
  state TEXT PRIMARY KEY, user_id TEXT NOT NULL, provider TEXT NOT NULL, created_at BIGINT NOT NULL
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
