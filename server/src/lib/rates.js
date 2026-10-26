import { config } from '../config.js'

// Rates are "units of currency per 1 USD". Live rates come from the free open.er-api.com service
// (updated daily, attribution required). If it cannot be reached we fall back to approximate fixed rates.
export const SUPPORTED = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD']
const FALLBACK = { USD: 1, INR: 88, EUR: 0.86, GBP: 0.75, CAD: 1.38, AUD: 1.52 }
const FRESH_MS = 12 * 60 * 60 * 1000
const RETRY_MS = 10 * 60 * 1000

let cache = { rates: FALLBACK, source: 'fallback', asOf: null, nextTry: 0 }
let inflight = null

async function refresh() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json()
    if (body?.result !== 'success') throw new Error('unexpected response')
    const rates = {}
    for (const c of SUPPORTED) {
      const v = Number(body.rates?.[c])
      if (!(v > 0)) throw new Error(`no rate for ${c}`)
      rates[c] = v
    }
    cache = { rates, source: 'live', asOf: body.time_last_update_utc || new Date().toUTCString(), nextTry: Date.now() + FRESH_MS }
  } catch (e) {
    console.warn('[rates] could not refresh exchange rates:', e.message)
    cache = { ...cache, nextTry: Date.now() + RETRY_MS }
  }
}

export async function getRates() {
  if (!config.allowPrivateFetch && Date.now() >= cache.nextTry) {
    inflight ??= refresh().finally(() => { inflight = null })
    await inflight
  }
  return { base: 'USD', rates: cache.rates, source: cache.source, asOf: cache.asOf }
}
