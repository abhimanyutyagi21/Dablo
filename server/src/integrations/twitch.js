import { config } from '../config.js'
import { db } from '../db.js'
import { upsertSynced } from '../lib/records.js'
import { getJson } from './http.js'

const SCOPES = 'moderator:read:followers'
const api = (token, path, params = {}) => getJson(`${config.urls.twitchApi}${path}?${new URLSearchParams(params)}`, { token, headers: { 'Client-Id': config.twitch.id } })

// Twitch's API has no revenue data, so this imports videos (VODs/highlights) with view counts and reads the follower total.
async function sync({ token, userId }) {
  const me = (await api(token, '/users')).data?.[0]
  if (!me) throw new Error('Could not read your Twitch account.')
  const vids = (await api(token, '/videos', { user_id: me.id, first: '100', type: 'all' })).data || []
  let followers = null
  try { followers = (await api(token, '/channels/followers', { broadcaster_id: me.id })).total } catch { /* scope not granted */ }
  let created = 0
  await db.tx(async (t) => {
    for (const v of vids) {
      const r = await upsertSynced(userId, `twitch:video:${v.id}`, 'content', {
        title: v.title || 'Untitled stream', url: v.url, platform: 'Twitch', format: 'Video',
        published: (v.created_at || '').slice(0, 10), views: Number(v.view_count || 0) }, t)
      if (r === 'created') created++
    }
  })
  return `${vids.length} videos (${created} new)${followers != null ? `, ${followers} followers` : ''}. Twitch does not provide revenue through its API.`
}

export default {
  id: 'twitch', label: 'Twitch', envHint: 'TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET',
  tokenUrl: config.urls.twitchToken,
  clientId: () => config.twitch.id, clientSecret: () => config.twitch.secret,
  configured: () => !!(config.twitch.id && config.twitch.secret),
  scopes: SCOPES,
  authorize: (state, redirectUri) => `${config.urls.twitchAuth}?${new URLSearchParams({
    client_id: config.twitch.id, redirect_uri: redirectUri, response_type: 'code', scope: SCOPES, state })}`,
  async fetchAccount(token) {
    const u = (await api(token, '/users')).data?.[0]
    if (!u) throw new Error('Could not read your Twitch account.')
    return { id: u.id, name: u.display_name }
  },
  revoke: (token) => fetch(`${config.urls.twitchRevoke}?${new URLSearchParams({ client_id: config.twitch.id, token })}`, { method: 'POST', signal: AbortSignal.timeout(10000) }),
  sync,
}
