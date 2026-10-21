import 'dotenv/config'

const env = process.env
const prod = env.NODE_ENV === 'production'
const need = (name, value) => {
  if (value && value.length >= 32) return value
  if (prod) { console.error(`${name} must be set to a random string of 32+ characters in production.`); process.exit(1) }
  return null
}

let secret = need('JWT_SECRET', env.JWT_SECRET)
if (!secret) { console.warn('[dev] JWT_SECRET missing or short — using an insecure development secret.'); secret = 'dev-only-insecure-secret-change-me-0123456789' }
// Separate key for encrypting platform tokens at rest (AES-256-GCM).
let tokenSecret = need('TOKEN_ENCRYPTION_KEY', env.TOKEN_ENCRYPTION_KEY)
if (!tokenSecret) { console.warn('[dev] TOKEN_ENCRYPTION_KEY missing or short — deriving a development key.'); tokenSecret = `${secret}:platform-tokens` }

const url = (name, fallback) => env[name] || fallback

export const config = {
  prod,
  port: Number(env.PORT) || 4000,
  jwtSecret: secret,
  tokenSecret,
  // Set TRUST_PROXY=1 when running behind nginx/Caddy/a PaaS so req.ip is the real visitor IP.
  trustProxy: /^\d+$/.test(env.TRUST_PROXY || '') ? Number(env.TRUST_PROXY) : false,
  clientOrigin: env.CLIENT_ORIGIN || 'http://localhost:5173',
  // Where the browser reaches the app. OAuth redirect URIs are built from this, e.g.
  // http://localhost:5173/api/integrations/youtube/callback
  publicUrl: (env.PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, ''),
  dbFile: env.DATABASE_FILE || 'data/dablo.db',
  google: { id: env.GOOGLE_CLIENT_ID || '', secret: env.GOOGLE_CLIENT_SECRET || '' },
  twitch: { id: env.TWITCH_CLIENT_ID || '', secret: env.TWITCH_CLIENT_SECRET || '' },
  anthropic: {
    key: env.ANTHROPIC_API_KEY || '',
    model: env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
    base: url('ANTHROPIC_BASE_URL', 'https://api.anthropic.com').replace(/\/$/, ''),
  },
  syncHours: Number(env.SYNC_INTERVAL_HOURS ?? 6),
  allowPrivateFetch: env.NODE_ENV === 'test', // only the automated tests may fetch loopback addresses
  // Provider endpoints. The env overrides exist so the automated tests can point at mock servers.
  urls: {
    googleAuth: url('GOOGLE_AUTH_URL', 'https://accounts.google.com/o/oauth2/v2/auth'),
    googleToken: url('GOOGLE_TOKEN_URL', 'https://oauth2.googleapis.com/token'),
    googleRevoke: url('GOOGLE_REVOKE_URL', 'https://oauth2.googleapis.com/revoke'),
    youtube: url('YOUTUBE_API_URL', 'https://www.googleapis.com/youtube/v3'),
    ytAnalytics: url('YT_ANALYTICS_URL', 'https://youtubeanalytics.googleapis.com/v2'),
    twitchAuth: url('TWITCH_AUTH_URL', 'https://id.twitch.tv/oauth2/authorize'),
    twitchToken: url('TWITCH_TOKEN_URL', 'https://id.twitch.tv/oauth2/token'),
    twitchRevoke: url('TWITCH_REVOKE_URL', 'https://id.twitch.tv/oauth2/revoke'),
    twitchApi: url('TWITCH_API_URL', 'https://api.twitch.tv/helix'),
  },
}
