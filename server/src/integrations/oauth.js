import { randomUUID } from 'node:crypto'
import { config } from '../config.js'
import { db } from '../db.js'
import { decrypt, encrypt } from '../lib/crypto.js'
import { logActivity } from '../lib/workspace.js'
import twitch from './twitch.js'
import youtube from './youtube.js'

export const providers = { youtube, twitch }
export const redirectUri = (id) => `${config.publicUrl}/api/integrations/${id}/callback`

async function tokenRequest(p, params) {
  let res
  try {
    res = await fetch(p.tokenUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: p.clientId(), client_secret: p.clientSecret(), ...params }), signal: AbortSignal.timeout(15000) })
  } catch { throw Object.assign(new Error('Could not reach the platform. Try again shortly.'), { status: 0 }) }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error_description || data.message || data.error || `Token request failed (${res.status}).`), { status: res.status, code: data.error })
  return data
}

export const exchangeCode = (p, code) => tokenRequest(p, { grant_type: 'authorization_code', code, redirect_uri: redirectUri(p.id) })

export async function saveConnection(userId, p, account, tokens) {
  const old = await db.get('SELECT refresh_token FROM integrations WHERE user_id = ? AND provider = ?', userId, p.id)
  const refresh = tokens.refresh_token ? encrypt(tokens.refresh_token) : old?.refresh_token || null
  await db.run(`INSERT INTO integrations (id, user_id, provider, account_id, account_name, access_token, refresh_token, expires_at, scopes, status, connected_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'connected', ?)
    ON CONFLICT(user_id, provider) DO UPDATE SET account_id = excluded.account_id, account_name = excluded.account_name,
      access_token = excluded.access_token, refresh_token = excluded.refresh_token, expires_at = excluded.expires_at,
      scopes = excluded.scopes, status = 'connected', connected_at = excluded.connected_at`,
    randomUUID(), userId, p.id, account.id, account.name, encrypt(tokens.access_token), refresh,
    Date.now() + (Number(tokens.expires_in) || 3600) * 1000, Array.isArray(tokens.scope) ? tokens.scope.join(' ') : tokens.scope || p.scopes, new Date().toISOString())
  return db.get('SELECT * FROM integrations WHERE user_id = ? AND provider = ?', userId, p.id)
}

const needsReconnect = async (integ) => {
  await db.run("UPDATE integrations SET status = 'needs_reconnect' WHERE id = ?", integ.id)
  return new Error('The connection expired or was revoked. Please reconnect.')
}

// Returns a valid access token, refreshing (and re-encrypting) it when it is about to expire.
export async function getAccessToken(integ) {
  if (integ.status === 'needs_reconnect') throw await needsReconnect(integ)
  if (integ.expires_at - Date.now() > 60_000) return decrypt(integ.access_token)
  if (!integ.refresh_token) throw await needsReconnect(integ)
  try {
    const t = await tokenRequest(providers[integ.provider], { grant_type: 'refresh_token', refresh_token: decrypt(integ.refresh_token) })
    await db.run('UPDATE integrations SET access_token = ?, refresh_token = COALESCE(?, refresh_token), expires_at = ? WHERE id = ?',
      encrypt(t.access_token), t.refresh_token ? encrypt(t.refresh_token) : null, Date.now() + (Number(t.expires_in) || 3600) * 1000, integ.id)
    return t.access_token
  } catch (e) {
    if (e.status === 400 || e.status === 401) throw await needsReconnect(integ)
    throw e
  }
}

const running = new Set()
export async function runSync(integ) {
  if (running.has(integ.id)) throw new Error('A sync is already running.')
  running.add(integ.id)
  const p = providers[integ.provider]
  try {
    const token = await getAccessToken(integ)
    const note = await p.sync({ integration: integ, token, userId: integ.user_id })
    await db.run("UPDATE integrations SET last_sync_at = ?, last_sync_note = ?, status = 'connected' WHERE id = ?", new Date().toISOString(), note, integ.id)
    await logActivity(integ.user_id, `Synced ${p.label}`, note)
    return note
  } catch (e) {
    await db.run('UPDATE integrations SET last_sync_note = ? WHERE id = ?', `Sync failed: ${e.message}`, integ.id)
    throw e
  } finally { running.delete(integ.id) }
}
