import { config } from '../config.js'
import { db } from '../db.js'
import { refreshFeed } from './rss.js'
import { runSync } from './oauth.js'

// Re-sync every connected platform and feed every SYNC_INTERVAL_HOURS (0 disables).
export async function syncAll() {
  for (const integ of await db.all("SELECT * FROM integrations WHERE status = 'connected'")) {
    try { await runSync(integ) } catch (e) { console.error(`[sync] ${integ.provider} failed: ${e.message}`) }
  }
  for (const feed of await db.all('SELECT * FROM feeds')) {
    try { await refreshFeed(feed) } catch (e) { console.error(`[sync] feed failed: ${e.message}`) }
  }
}

export function startScheduler() {
  if (!(config.syncHours > 0)) return
  setInterval(() => { syncAll().catch((e) => console.error('[sync]', e)) }, config.syncHours * 3600 * 1000).unref()
}
