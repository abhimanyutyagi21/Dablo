import { config } from '../config.js'
import { db } from '../db.js'
import { upsertSynced } from '../lib/records.js'
import { getJson } from './http.js'

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',            // channel + video stats (Data API)
  'https://www.googleapis.com/auth/yt-analytics.readonly',       // YouTube Analytics API
  'https://www.googleapis.com/auth/yt-analytics-monetary.readonly', // estimated revenue (monetized channels only)
]
const day = (d) => d.toISOString().slice(0, 10)
const seconds = (iso) => { const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || ''); return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0 }

async function sync({ token, userId }) {
  const data = (path, params) => getJson(`${config.urls.youtube}${path}?${new URLSearchParams(params)}`, { token })
  const channel = (await data('/channels', { part: 'snippet,contentDetails,statistics', mine: 'true' })).items?.[0]
  if (!channel) throw new Error('No YouTube channel found for this Google account.')

  // Videos: uploads playlist (up to 200 newest) -> statistics in batches of 50.
  const ids = []
  let page = ''
  for (let i = 0; i < 4; i++) {
    const r = await data('/playlistItems', { part: 'contentDetails', playlistId: channel.contentDetails.relatedPlaylists.uploads, maxResults: '50', ...(page && { pageToken: page }) })
    ids.push(...(r.items || []).map((x) => x.contentDetails.videoId))
    page = r.nextPageToken
    if (!page) break
  }
  const videos = []
  for (let i = 0; i < ids.length; i += 50) videos.push(...((await data('/videos', { part: 'snippet,statistics,contentDetails', id: ids.slice(i, i + 50).join(',') })).items || []))

  // Estimated revenue per month from the Analytics API. Requested in the workspace currency so totals never mix currencies.
  const wanted = db.prepare('SELECT data FROM settings WHERE user_id = ?').get(userId)
  const currency = (wanted && JSON.parse(wanted.data).currency) || 'USD'
  const from = new Date(); from.setUTCDate(1); from.setUTCMonth(from.getUTCMonth() - 5)
  const start = day(from) > channel.snippet.publishedAt.slice(0, 10) ? day(from) : channel.snippet.publishedAt.slice(0, 10)
  const report = (cur) => getJson(`${config.urls.ytAnalytics}/reports?${new URLSearchParams({
    ids: 'channel==MINE', startDate: start, endDate: day(new Date()), metrics: 'estimatedRevenue', dimensions: 'day', sort: 'day', currency: cur })}`, { token })
  const months = new Map()
  let revenueNote = ''
  let used = currency
  try {
    let r
    try { r = await report(currency) } catch (e) { if (e.status !== 400) throw e; used = 'USD'; r = await report('USD') }
    for (const [d, v] of r.rows || []) months.set(d.slice(0, 7), (months.get(d.slice(0, 7)) || 0) + Number(v || 0))
  } catch (e) {
    revenueNote = e.status === 403 ? 'Revenue is not available for this channel (it needs YouTube Partner Program access and the revenue permission).' : `Revenue could not be loaded: ${e.message}`
  }

  let created = 0, months_ = 0
  db.transaction(() => {
    for (const v of videos) {
      const r = upsertSynced(userId, `youtube:video:${v.id}`, 'content', {
        title: v.snippet.title, url: `https://www.youtube.com/watch?v=${v.id}`, platform: 'YouTube',
        format: seconds(v.contentDetails?.duration) <= 60 ? 'Short-form video' : 'Video',
        published: v.snippet.publishedAt.slice(0, 10), views: Number(v.statistics?.viewCount || 0) })
      if (r === 'created') created++
    }
    for (const [m, amount] of months) {
      if (amount <= 0) continue
      upsertSynced(userId, `youtube:rev:${m}`, 'revenue', {
        title: `YouTube ad revenue ${m} (estimated)`, amount: Math.round(amount * 100) / 100, currency: used, date: `${m}-01`,
        source: 'Platform payout', platform: 'YouTube', attribution: 'Estimated', conversionType: 'Payout',
        reference: `youtube-analytics-${m}`, notes: 'Imported from YouTube Analytics. This is an estimate, not an actual payout.' })
      months_++
    }
  })()
  return `${videos.length} videos (${created} new), ${months_} revenue months. ${revenueNote}`.trim()
}

export default {
  id: 'youtube', label: 'YouTube', envHint: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET',
  tokenUrl: config.urls.googleToken,
  clientId: () => config.google.id, clientSecret: () => config.google.secret,
  configured: () => !!(config.google.id && config.google.secret),
  scopes: SCOPES.join(' '),
  authorize: (state, redirectUri) => `${config.urls.googleAuth}?${new URLSearchParams({
    client_id: config.google.id, redirect_uri: redirectUri, response_type: 'code', scope: SCOPES.join(' '),
    access_type: 'offline', prompt: 'consent', state })}`,
  async fetchAccount(token) {
    const c = (await getJson(`${config.urls.youtube}/channels?${new URLSearchParams({ part: 'snippet', mine: 'true' })}`, { token })).items?.[0]
    if (!c) throw new Error('This Google account has no YouTube channel.')
    return { id: c.id, name: c.snippet.title }
  },
  revoke: (token) => fetch(`${config.urls.googleRevoke}?token=${encodeURIComponent(token)}`, { method: 'POST', signal: AbortSignal.timeout(10000) }),
  sync,
}
