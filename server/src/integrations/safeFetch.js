import dns from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import { config } from '../config.js'

// Feeds are fetched from URLs users type in, so this guards against SSRF: private/loopback/link-local
// addresses are refused (checked again at connect time to defeat DNS rebinding), redirects are
// re-validated, and size/time are capped.
export function isPrivateAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0))
  }
  const v = ip.toLowerCase()
  if (v === '::' || v === '::1') return true
  if (v.startsWith('::ffff:')) { const rest = v.slice(7); return rest.includes('.') ? isPrivateAddress(rest) : true }
  return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(v)
}

const makeLookup = (allowPrivate) => (host, opts, cb) => dns.lookup(host, { ...opts, all: true }, (err, addrs) => {
  if (err) return cb(err)
  const ok = allowPrivate ? addrs : addrs.filter((a) => !isPrivateAddress(a.address))
  if (!ok.length) return cb(new Error('blocked'))
  return opts.all ? cb(null, ok) : cb(null, ok[0].address, ok[0].family)
})

const BLOCKED = 'That address is not allowed.'
const FAILED = 'Could not fetch that URL.'

function readBody(res, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0
    res.on('data', (c) => {
      size += c.length
      if (size > maxBytes) { res.destroy(); reject(new Error('That feed is too large.')); return }
      chunks.push(c)
    })
    res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    res.on('error', () => reject(new Error(FAILED)))
  })
}

export async function safeGet(rawUrl, { maxBytes = 2_000_000, timeout = 10_000, redirects = 3, allowPrivate = config.allowPrivateFetch } = {}) {
  let url
  try { url = new URL(rawUrl) } catch { throw new Error('Enter a valid http or https URL.') }
  for (let hop = 0; hop <= redirects; hop++) {
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http and https URLs are allowed.')
    const host = url.hostname.replace(/^\[|\]$/g, '')
    if (net.isIP(host) && !allowPrivate && isPrivateAddress(host)) throw new Error(BLOCKED) // literals skip DNS lookup
    const res = await new Promise((resolve, reject) => {
      const lib = url.protocol === 'https:' ? https : http
      const req = lib.get(url, {
        lookup: makeLookup(allowPrivate), timeout,
        headers: { 'User-Agent': 'DabloFeedFetcher/1.0', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5' },
      }, resolve)
      req.on('timeout', () => req.destroy(new Error('timeout')))
      req.on('error', (e) => reject(new Error(e.message === 'blocked' ? BLOCKED : FAILED)))
    })
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      res.resume()
      try { url = new URL(res.headers.location, url) } catch { throw new Error(FAILED) }
      continue
    }
    if (res.statusCode !== 200) { res.resume(); throw new Error(`The feed returned HTTP ${res.statusCode}.`) }
    return readBody(res, maxBytes)
  }
  throw new Error('Too many redirects.')
}
