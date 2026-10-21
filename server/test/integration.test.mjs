// End-to-end tests: starts mock Google / Twitch / Anthropic / feed servers, starts the real API against them,
// and drives it over HTTP. No real credentials or internet needed.  Run with: npm test
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { isPrivateAddress, safeGet } from '../src/integrations/safeFetch.js'

const API_PORT = 4200
const API = `http://127.0.0.1:${API_PORT}`
const mockState = {
  google: { denyRevenue: false, revokeRefresh: false, refreshCalls: 0, revoked: 0, bearers: [], currencies: [], v1Views: 1500 },
  anthropic: { status: 200, reply: null, requests: [] },
}
let mock, mockUrl, api, tmp, db
let apiLog = ''

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>My Blog</title>
<item><title><![CDATA[First post]]></title><link>https://blog.example.com/first</link><guid>g1</guid><pubDate>Tue, 01 Sep 2026 10:00:00 GMT</pubDate></item>
<item><title>Second &amp; post</title><link>https://blog.example.com/second</link><guid isPermaLink="false">g2</guid><pubDate>Wed, 02 Sep 2026 10:00:00 GMT</pubDate></item>
</channel></rss>`
const ATOM = `<feed xmlns="http://www.w3.org/2005/Atom"><title>Weekly Letter</title><entry><title>Issue 1</title><link rel="alternate" href="https://news.example.com/1"/><id>tag:1</id><updated>2026-09-05T00:00:00Z</updated></entry></feed>`

const send = (rs, status, body, type = 'application/json') => { rs.writeHead(status, { 'content-type': type }); rs.end(typeof body === 'string' ? body : JSON.stringify(body)) }

async function mockHandler(req, rs) {
  const chunks = []
  for await (const c of req) chunks.push(c)
  const raw = Buffer.concat(chunks).toString()
  const url = new URL(req.url, 'http://x')
  const bearer = (req.headers.authorization || '').replace('Bearer ', '')
  const g = mockState.google
  const form = () => new URLSearchParams(raw)

  // ── Google OAuth + YouTube ──
  if (url.pathname === '/google/token') {
    const f = form()
    if (f.get('client_id') !== 'gid' || f.get('client_secret') !== 'gsecret') return send(rs, 401, { error: 'invalid_client' })
    if (f.get('grant_type') === 'authorization_code') {
      if (f.get('code') !== 'good-code' || f.get('redirect_uri') !== 'http://localhost:5173/api/integrations/youtube/callback') return send(rs, 400, { error: 'invalid_grant' })
      return send(rs, 200, { access_token: 'at1', refresh_token: 'rt1', expires_in: 3600, scope: 'youtube' })
    }
    g.refreshCalls++
    if (g.revokeRefresh || f.get('refresh_token') !== 'rt1') return send(rs, 400, { error: 'invalid_grant' })
    return send(rs, 200, { access_token: 'at2', expires_in: 3600 })
  }
  if (url.pathname === '/google/revoke') { g.revoked++; return send(rs, 200, {}) }
  if (url.pathname.startsWith('/google/youtube/v3/')) {
    if (!['at1', 'at2'].includes(bearer)) return send(rs, 401, { error: { message: 'bad token' } })
    g.bearers.push(bearer)
    const p = url.pathname.replace('/google/youtube/v3', '')
    if (p === '/channels') return send(rs, 200, { items: [{ id: 'UC1', snippet: { title: 'My Channel', publishedAt: '2020-01-01T00:00:00Z' }, contentDetails: { relatedPlaylists: { uploads: 'UU1' } } }] })
    if (p === '/playlistItems') return send(rs, 200, { items: [{ contentDetails: { videoId: 'v1' } }, { contentDetails: { videoId: 'v2' } }] })
    if (p === '/videos') return send(rs, 200, { items: [
      { id: 'v1', snippet: { title: 'Video One', publishedAt: '2026-08-01T00:00:00Z' }, statistics: { viewCount: String(g.v1Views) }, contentDetails: { duration: 'PT10M' } },
      { id: 'v2', snippet: { title: 'Short Two', publishedAt: '2026-08-02T00:00:00Z' }, statistics: { viewCount: '300' }, contentDetails: { duration: 'PT45S' } }] })
  }
  if (url.pathname === '/google/analytics/v2/reports') {
    g.currencies.push(url.searchParams.get('currency'))
    g.bearers.push(bearer)
    if (g.denyRevenue) return send(rs, 403, { error: { message: 'Forbidden' } })
    return send(rs, 200, { rows: [['2026-09-10', 5], ['2026-09-11', 7.5], ['2026-10-01', 3]] })
  }

  // ── Twitch ──
  if (url.pathname === '/twitch/token') {
    const f = form()
    if (f.get('client_id') !== 'tid' || f.get('client_secret') !== 'tsecret' || f.get('code') !== 'twitch-code') return send(rs, 400, { message: 'bad' })
    return send(rs, 200, { access_token: 'tat', refresh_token: 'trt', expires_in: 3600, scope: ['moderator:read:followers'] })
  }
  if (url.pathname.startsWith('/twitch/helix/')) {
    if (bearer !== 'tat' || req.headers['client-id'] !== 'tid') return send(rs, 401, { message: 'bad' })
    const p = url.pathname.replace('/twitch/helix', '')
    if (p === '/users') return send(rs, 200, { data: [{ id: '77', display_name: 'StreamerOne' }] })
    if (p === '/videos') return send(rs, 200, { data: [{ id: 't1', title: 'Late night stream', url: 'https://www.twitch.tv/videos/t1', created_at: '2026-09-01T10:00:00Z', view_count: 42 }] })
    if (p === '/channels/followers') return send(rs, 200, { total: 123 })
  }
  if (url.pathname === '/twitch/revoke') return send(rs, 200, {})

  // ── Anthropic ──
  if (url.pathname === '/v1/messages') {
    const a = mockState.anthropic
    a.requests.push({ headers: req.headers, body: JSON.parse(raw) })
    if (a.status !== 200) return send(rs, a.status, { error: { message: 'nope' } })
    const text = a.reply ?? JSON.stringify({ headline: 'Steady growth', summary: 'Revenue is recorded across sources.', highlights: ['One', 'Two'], watchouts: ['Estimated revenue'], nextSteps: ['Check links', 'Add campaigns'] })
    return send(rs, 200, { content: [{ type: 'text', text }] })
  }

  // ── Feeds ──
  if (url.pathname === '/feed.xml') return send(rs, 200, RSS, 'application/rss+xml')
  if (url.pathname === '/atom.xml') return send(rs, 200, ATOM, 'application/atom+xml')
  if (url.pathname === '/bad') return send(rs, 200, 'this is not a feed <<<', 'text/plain')
  send(rs, 404, { error: 'not found' })
}

before(async () => {
  mock = http.createServer((req, rs) => mockHandler(req, rs).catch((e) => send(rs, 500, String(e))))
  await new Promise((r) => mock.listen(0, '127.0.0.1', r))
  mockUrl = `http://127.0.0.1:${mock.address().port}`
  tmp = mkdtempSync(join(tmpdir(), 'dablo-test-'))
  const file = join(tmp, 'test.db')
  api = spawn('node', ['src/index.js'], { cwd: new URL('..', import.meta.url).pathname, env: {
    ...process.env, NODE_ENV: 'test', PORT: String(API_PORT), DATABASE_FILE: file, SYNC_INTERVAL_HOURS: '0',
    JWT_SECRET: 'j'.repeat(40), TOKEN_ENCRYPTION_KEY: 't'.repeat(40), PUBLIC_URL: 'http://localhost:5173',
    GOOGLE_CLIENT_ID: 'gid', GOOGLE_CLIENT_SECRET: 'gsecret', GOOGLE_AUTH_URL: `${mockUrl}/google/auth`, GOOGLE_TOKEN_URL: `${mockUrl}/google/token`,
    GOOGLE_REVOKE_URL: `${mockUrl}/google/revoke`, YOUTUBE_API_URL: `${mockUrl}/google/youtube/v3`, YT_ANALYTICS_URL: `${mockUrl}/google/analytics/v2`,
    TWITCH_CLIENT_ID: 'tid', TWITCH_CLIENT_SECRET: 'tsecret', TWITCH_AUTH_URL: `${mockUrl}/twitch/auth`, TWITCH_TOKEN_URL: `${mockUrl}/twitch/token`,
    TWITCH_REVOKE_URL: `${mockUrl}/twitch/revoke`, TWITCH_API_URL: `${mockUrl}/twitch/helix`,
    ANTHROPIC_API_KEY: 'test-key', ANTHROPIC_BASE_URL: mockUrl } })
  api.stdout.on('data', (d) => { apiLog += d }); api.stderr.on('data', (d) => { apiLog += d })
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${API}/api/health`)).ok) break } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200))
    if (i === 49) throw new Error('API did not start:\n' + apiLog)
  }
  db = new Database(file)
})

after(() => { api?.kill(); mock?.closeAllConnections?.(); mock?.close(); db?.close(); if (tmp) rmSync(tmp, { recursive: true, force: true }) })

class Client {
  cookie = ''
  async call(method, path, body) {
    const res = await fetch(API + path, { method, redirect: 'manual',
      headers: { 'user-agent': 'Mozilla/5.0 (test)', ...(body !== undefined && { 'content-type': 'application/json' }), ...(this.cookie && { cookie: this.cookie }) },
      body: body !== undefined ? JSON.stringify(body) : undefined })
    const sc = res.headers.getSetCookie?.() || []
    if (sc.length) this.cookie = sc[0].split(';')[0]
    const data = (res.headers.get('content-type') || '').includes('json') ? await res.json() : null
    return { status: res.status, data, location: res.headers.get('location') || '' }
  }
  get = (p) => this.call('GET', p)
  post = (p, b = {}) => this.call('POST', p, b)
  patch = (p, b) => this.call('PATCH', p, b)
  del = (p) => this.call('DELETE', p)
}
const A = new Client(), B = new Client()
const workspace = async (c) => (await c.get('/api/workspace')).data
const contentOf = async (c, platform) => (await workspace(c)).collections.content.filter((x) => x.platform === platform)
const youtubeRevenue = async (c) => (await workspace(c)).collections.revenue.filter((x) => x.platform === 'YouTube')
const connectInfo = async (c, id) => (await c.get('/api/integrations')).data.providers.find((p) => p.id === id)
async function oauth(c, provider, code) {
  const { data } = await c.get(`/api/integrations/${provider}/connect`)
  const state = new URL(data.url).searchParams.get('state')
  return c.get(`/api/integrations/${provider}/callback?code=${code}&state=${state}`)
}

test('accounts and the tracking redirect still work', async () => {
  assert.equal((await A.get('/api/integrations')).status, 401)
  assert.equal((await A.post('/api/auth/signup', { name: 'Test A', email: 'a@x.com', password: 'password123' })).status, 201)
  assert.equal((await A.post('/api/records/links', { name: 'Yt', destination: 'https://example.com/p?x=1', slug: 'yt-test', source: 'youtube', medium: 'social', status: 'Active' })).status, 201)
  const r = await fetch(`${API}/r/yt-test`, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (test)' } })
  assert.equal(r.status, 302)
  assert.match(r.headers.get('location'), /utm_source=youtube/)
  await fetch(`${API}/r/yt-test`, { redirect: 'manual', headers: { 'user-agent': 'Googlebot/2.1' } })
  assert.equal((await workspace(A)).collections.links[0].clicks, 1)
})

test('YouTube: the connect URL asks for the right access', async () => {
  const p = await connectInfo(A, 'youtube')
  assert.equal(p.configured, true); assert.equal(p.connection, null)
  const { data } = await A.get('/api/integrations/youtube/connect')
  const u = new URL(data.url)
  assert.equal(u.searchParams.get('client_id'), 'gid')
  assert.equal(u.searchParams.get('access_type'), 'offline')
  assert.equal(u.searchParams.get('redirect_uri'), 'http://localhost:5173/api/integrations/youtube/callback')
  assert.match(u.searchParams.get('scope'), /youtube\.readonly/)
  assert.match(u.searchParams.get('scope'), /yt-analytics-monetary\.readonly/)
  assert.equal(u.searchParams.get('state').length, 48)
})

test('YouTube: forged or foreign state is rejected', async () => {
  assert.match((await A.get('/api/integrations/youtube/callback?code=good-code&state=forged')).location, /error=/)
  await B.post('/api/auth/signup', { name: 'Test B', email: 'b@x.com', password: 'password123' })
  const { data } = await A.get('/api/integrations/youtube/connect')
  const stolen = new URL(data.url).searchParams.get('state')
  assert.match((await B.get(`/api/integrations/youtube/callback?code=good-code&state=${stolen}`)).location, /error=/)
  assert.equal((await connectInfo(B, 'youtube')).connection, null)
})

test('YouTube: connect imports videos and estimated revenue, tokens stay encrypted', async () => {
  const res = await oauth(A, 'youtube', 'good-code')
  assert.match(res.location, /^http:\/\/localhost:5173\/app\/platforms\?connected=youtube/)
  const info = await connectInfo(A, 'youtube')
  assert.equal(info.connection.accountName, 'My Channel'); assert.equal(info.connection.status, 'connected')
  const text = JSON.stringify((await A.get('/api/integrations')).data)
  assert.ok(!text.includes('at1') && !text.includes('rt1'), 'tokens must never be sent to the client')
  const row = db.prepare("SELECT access_token, refresh_token FROM integrations WHERE provider='youtube'").get()
  assert.ok(!row.access_token.includes('at1') && !row.refresh_token.includes('rt1'), 'tokens must be encrypted at rest')

  const videos = await contentOf(A, 'YouTube')
  assert.equal(videos.length, 2)
  const v1 = videos.find((v) => v.title === 'Video One'), v2 = videos.find((v) => v.title === 'Short Two')
  assert.equal(v1.views, 1500); assert.equal(v1.format, 'Video'); assert.equal(v1.synced, 'youtube')
  assert.equal(v2.format, 'Short-form video')
  const rev = (await youtubeRevenue(A)).sort((a, b) => a.date.localeCompare(b.date))
  assert.equal(rev.length, 2)
  assert.deepEqual(rev.map((r) => r.amount), [12.5, 3])
  assert.equal(rev[0].attribution, 'Estimated'); assert.equal(rev[0].currency, 'INR')
  assert.deepEqual([...new Set(mockState.google.currencies)], ['INR'])
})

test('YouTube: syncing again never duplicates, and user edits survive', async () => {
  const v1 = (await contentOf(A, 'YouTube')).find((v) => v.title === 'Video One')
  const { id, createdAt, synced, ...fields } = v1
  assert.equal((await A.patch(`/api/records/content/${id}`, { ...fields, notes: 'my note', campaign: 'Fall' })).status, 200)
  mockState.google.v1Views = 2000
  assert.equal((await A.post('/api/integrations/youtube/sync')).status, 200)
  const after = await contentOf(A, 'YouTube')
  assert.equal(after.length, 2); assert.equal((await youtubeRevenue(A)).length, 2)
  const edited = after.find((v) => v.id === id)
  assert.equal(edited.views, 2000); assert.equal(edited.notes, 'my note'); assert.equal(edited.campaign, 'Fall')
})

test('YouTube: an expired access token is refreshed automatically', async () => {
  db.prepare("UPDATE integrations SET expires_at = 1 WHERE provider = 'youtube'").run()
  assert.equal((await A.post('/api/integrations/youtube/sync')).status, 200)
  assert.equal(mockState.google.refreshCalls, 1)
  assert.equal(mockState.google.bearers.at(-1), 'at2')
})

test('YouTube: channels without revenue access still import videos', async () => {
  mockState.google.denyRevenue = true
  const r = await A.post('/api/integrations/youtube/sync')
  assert.equal(r.status, 200); assert.match(r.data.note, /not available/i)
  assert.equal((await contentOf(A, 'YouTube')).length, 2)
  mockState.google.denyRevenue = false
})

test('YouTube: a revoked connection asks the user to reconnect', async () => {
  mockState.google.revokeRefresh = true
  db.prepare("UPDATE integrations SET expires_at = 1 WHERE provider = 'youtube'").run()
  const r = await A.post('/api/integrations/youtube/sync')
  assert.equal(r.status, 502); assert.match(r.data.error, /reconnect/i)
  assert.equal((await connectInfo(A, 'youtube')).connection.status, 'needs_reconnect')
})

test('YouTube: disconnecting revokes access but keeps imported records', async () => {
  assert.equal((await A.del('/api/integrations/youtube')).status, 200)
  assert.equal(mockState.google.revoked, 1)
  assert.equal((await connectInfo(A, 'youtube')).connection, null)
  assert.equal((await contentOf(A, 'YouTube')).length, 2)
  assert.equal(db.prepare("SELECT COUNT(*) n FROM integrations WHERE provider='youtube'").get().n, 0)
})

test('Twitch: connect imports videos and follower count', async () => {
  assert.match((await oauth(A, 'twitch', 'twitch-code')).location, /connected=twitch/)
  const t = await contentOf(A, 'Twitch')
  assert.equal(t.length, 1); assert.equal(t[0].views, 42); assert.equal(t[0].synced, 'twitch')
  assert.match((await connectInfo(A, 'twitch')).connection.note, /123 followers/)
})

test('connections are private to each user', async () => {
  assert.equal((await connectInfo(B, 'twitch')).connection, null)
  assert.equal((await B.post('/api/integrations/twitch/sync')).status, 404)
  assert.equal((await B.del('/api/integrations/twitch')).status, 404)
  assert.equal((await contentOf(B, 'Twitch')).length, 0)
})

test('RSS: blogs and newsletters import without duplicates', async () => {
  const add = await A.post('/api/integrations/feeds', { url: `${mockUrl}/feed.xml`, platform: 'Blog' })
  assert.equal(add.status, 201)
  const posts = await contentOf(A, 'Blog')
  assert.equal(posts.length, 2)
  assert.deepEqual(posts.map((p) => p.title).sort(), ['First post', 'Second & post'])
  assert.equal(posts[0].format, 'Article'); assert.ok(posts.some((p) => p.published === '2026-09-01'))
  assert.equal((await A.post('/api/integrations/feeds', { url: `${mockUrl}/feed.xml`, platform: 'Blog' })).status, 409)
  assert.match((await A.post('/api/integrations/feeds', { url: `${mockUrl}/bad`, platform: 'Blog' })).data.error, /valid RSS/)
  assert.equal((await A.post('/api/integrations/feeds', { url: 'ftp://example.com/feed', platform: 'Blog' })).status, 400)
  assert.equal((await A.post('/api/integrations/feeds', { url: `${mockUrl}/feed.xml`, platform: 'Nope' })).status, 400)
  const atom = await A.post('/api/integrations/feeds', { url: `${mockUrl}/atom.xml`, platform: 'Newsletter' })
  assert.equal(atom.status, 201)
  assert.equal((await contentOf(A, 'Newsletter'))[0].format, 'Newsletter')
  const feedId = (await A.get('/api/integrations')).data.feeds.find((f) => f.platform === 'Blog').id
  assert.equal((await A.post(`/api/integrations/feeds/${feedId}/sync`)).status, 200)
  assert.equal((await contentOf(A, 'Blog')).length, 2)
  assert.equal((await B.post(`/api/integrations/feeds/${feedId}/sync`)).status, 404)
  assert.equal((await A.del(`/api/integrations/feeds/${feedId}`)).status, 200)
  assert.equal((await contentOf(A, 'Blog')).length, 2)
})

test('feeds cannot be used to reach private networks (SSRF guard)', async () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '0.0.0.0', '::1', 'fe80::1', 'fd00::1', '::ffff:127.0.0.1']) assert.equal(isPrivateAddress(ip), true, ip)
  for (const ip of ['8.8.8.8', '1.1.1.1', '172.32.0.1', '2606:4700:4700::1111']) assert.equal(isPrivateAddress(ip), false, ip)
  const port = new URL(mockUrl).port
  for (const bad of [`${mockUrl}/feed.xml`, `http://localhost:${port}/feed.xml`, `http://[::1]:${port}/`, 'http://169.254.169.254/latest/meta-data/']) {
    await assert.rejects(safeGet(bad, { allowPrivate: false }), /not allowed/, bad)
  }
  await assert.rejects(safeGet('file:///etc/passwd', { allowPrivate: false }), /http/)
  assert.match(await safeGet(`${mockUrl}/feed.xml`, { allowPrivate: true }), /My Blog/)
})

const addContent = (c, n) => c.post('/api/records/content', { title: `Post ${n}`, platform: 'Blog' })

test('AI summary: sends only aggregates, caches, and handles odd or failing replies', async () => {
  const s0 = (await A.get('/api/insights/summary')).data
  assert.equal(s0.configured, true); assert.equal(s0.summary, null)

  const first = await A.post('/api/insights/summary', {})
  assert.equal(first.status, 200); assert.equal(first.data.cached, false)
  assert.equal(first.data.summary.headline, 'Steady growth'); assert.equal(first.data.summary.nextSteps.length, 2)
  const req = mockState.anthropic.requests[0]
  assert.equal(req.headers['x-api-key'], 'test-key'); assert.ok(req.headers['anthropic-version'])
  assert.equal(req.body.model, 'claude-haiku-5-5')
  const prompt = req.body.messages[0].content
  assert.match(prompt, /Content #1/)
  for (const secret of ['Video One', 'Late night stream', 'First post', 'a@x.com', 'Test A']) assert.ok(!prompt.includes(secret), `prompt must not contain "${secret}"`)

  const again = await A.post('/api/insights/summary', {})
  assert.equal(again.data.cached, true); assert.equal(mockState.anthropic.requests.length, 1)

  const titled = await A.post('/api/insights/summary', { includeTitles: true })
  assert.equal(titled.data.cached, false); assert.match(mockState.anthropic.requests[1].body.messages[0].content, /Video One/)

  await addContent(A, 1)
  mockState.anthropic.reply = '```json\n{"headline":"Fenced","summary":"Parsed from a code fence.","highlights":["a"],"watchouts":[],"nextSteps":["b"]}\n```'
  assert.equal((await A.post('/api/insights/summary', {})).data.summary.headline, 'Fenced')

  await addContent(A, 2)
  mockState.anthropic.reply = 'Plain text instead of JSON'
  const plain = (await A.post('/api/insights/summary', {})).data.summary
  assert.equal(plain.summary, 'Plain text instead of JSON'); assert.deepEqual(plain.highlights, [])

  await addContent(A, 3)
  mockState.anthropic.status = 401
  const bad = await A.post('/api/insights/summary', {})
  assert.equal(bad.status, 502); assert.match(bad.data.error, /rejected/)
  mockState.anthropic.status = 200; mockState.anthropic.reply = null

  assert.equal((await B.get('/api/insights/summary')).data.summary, null)
  assert.equal((await B.post('/api/insights/summary', {})).status, 400)
  assert.equal((await new Client().post('/api/insights/summary', {})).status, 401)
})
