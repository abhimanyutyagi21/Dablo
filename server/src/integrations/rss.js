import { createHash } from 'node:crypto'
import { XMLParser } from 'fast-xml-parser'
import { db } from '../db.js'
import { upsertSynced } from '../lib/records.js'
import { safeGet } from './safeFetch.js'

// Blogs, newsletters (Substack, beehiiv, Ghost, WordPress…) and podcasts all publish RSS/Atom, so one importer covers them without OAuth or app review.
export const FEED_TYPES = ['Blog', 'Newsletter', 'Podcast', 'Other']
const FORMAT = { Blog: 'Article', Newsletter: 'Newsletter', Podcast: 'Podcast', Other: 'Post' }
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text' })

const text = (v) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : v && v['#text'] != null ? String(v['#text']) : '')
function linkOf(item) {
  if (typeof item.link === 'string') return item.link
  const links = [].concat(item.link || [])
  const l = links.find((x) => x && (x['@_rel'] === 'alternate' || !x['@_rel'])) || links[0]
  return (l && (l['@_href'] || text(l))) || ''
}
const httpUrl = (v) => { try { return ['http:', 'https:'].includes(new URL(v).protocol) ? v : '' } catch { return '' } }

export async function syncFeed(feed) {
  const xml = await safeGet(feed.url)
  let doc
  try { doc = parser.parse(xml) } catch { throw new Error('That URL did not return a valid RSS or Atom feed.') }
  const channel = doc?.rss?.channel || doc?.feed
  if (!channel) throw new Error('That URL did not return a valid RSS or Atom feed.')
  const items = [].concat(channel.item || channel.entry || []).slice(0, 100)
  let created = 0
  db.transaction(() => {
    for (const it of items) {
      const title = text(it.title).trim().slice(0, 200) || 'Untitled'
      const url = httpUrl(linkOf(it).trim())
      const when = new Date(text(it.pubDate) || text(it.published) || text(it.updated))
      const key = createHash('sha1').update(text(it.guid) || text(it.id) || url || title).digest('hex').slice(0, 16)
      const r = upsertSynced(feed.user_id, `rss:${feed.id}:${key}`, 'content', {
        title, url, platform: feed.platform, format: FORMAT[feed.platform] || 'Post', ...(isNaN(when) ? {} : { published: when.toISOString().slice(0, 10) }) })
      if (r === 'created') created++
    }
  })()
  return { title: text(channel.title).trim().slice(0, 200), note: `${items.length} items (${created} new).` }
}

// Sync one feed row and record the result on it.
export async function refreshFeed(feed) {
  try {
    const { title, note } = await syncFeed(feed)
    db.prepare('UPDATE feeds SET title = ?, last_sync_at = ?, last_sync_note = ? WHERE id = ?').run(title || feed.title, new Date().toISOString(), note, feed.id)
    return note
  } catch (e) {
    db.prepare('UPDATE feeds SET last_sync_note = ? WHERE id = ?').run(`Sync failed: ${e.message}`, feed.id)
    throw e
  }
}
