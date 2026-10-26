// Server-side validation. Mirrors the field lists in src/app/definitions.js on the client.
// Spec: 'str' | 'num' | 'date' | 'url' (add '!' = required) or an array = required one-of.
const CUR = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD']

export const TYPES = {
  content: { singular: 'content item', fields: {
    title: 'str!', url: 'url', platform: 'str!', format: 'str', published: 'date', views: 'num', clicks: 'num', conversions: 'num',
    revenue: 'num', currency: 'cur', campaign: 'str', product: 'str', tags: 'str', notes: 'str' } },
  revenue: { singular: 'revenue record', fields: {
    title: 'str!', amount: 'num!', currency: CUR, date: 'date!', source: ['Affiliate', 'Sponsorship', 'Digital product', 'Services', 'Platform payout', 'Other'],
    platform: 'str', product: 'str', campaign: 'str', content: 'str', link: 'str', conversionType: 'str',
    attribution: ['Attributed', 'Manually associated', 'Unattributed', 'Estimated'], reference: 'str', notes: 'str' } },
  links: { singular: 'tracking link', fields: {
    name: 'str!', destination: 'url!', slug: 'str', content: 'str', campaign: 'str', product: 'str', source: 'str', medium: 'str',
    status: ['Active', 'Paused'], conversions: 'num', revenue: 'num', currency: 'cur' } },
  campaigns: { singular: 'campaign', fields: {
    name: 'str!', description: 'str', start: 'date', end: 'date', status: ['Planning', 'Active', 'Completed', 'Archived'],
    products: 'str', content: 'str', links: 'str', budget: 'num', currency: 'cur', notes: 'str' } },
  products: { singular: 'product or offer', fields: {
    name: 'str!', type: 'str!', url: 'url', price: 'num', currency: CUR, status: ['Active', 'Draft', 'Archived'], description: 'str', notes: 'str' } },
  frameworks: { singular: 'framework', fields: {
    name: 'str!', topic: 'str', hook: 'str', structure: 'str!', cta: 'str', evidence: 'str', status: ['Draft', 'Testing', 'Proven pattern'], notes: 'str' } },
}

const isHttpUrl = (v) => { try { return ['http:', 'https:'].includes(new URL(v).protocol) } catch { return false } }

// Returns { data } with only known, coerced fields, or { error }.
export function clean(type, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Invalid request body.' }
  const out = {}
  for (const [key, spec] of Object.entries(TYPES[type].fields)) {
    const raw = input[key]
    if (Array.isArray(spec)) {
      const v = String(raw ?? '').trim()
      if (!spec.includes(v)) return { error: `${key} must be one of: ${spec.join(', ')}.` }
      out[key] = v
      continue
    }
    const required = spec.endsWith('!')
    const kind = required ? spec.slice(0, -1) : spec
    const empty = raw === undefined || raw === null || String(raw).trim() === ''
    if (required && empty) return { error: `${key} is required.` }
    if (kind === 'cur') { // optional currency code stamped on records whose amounts have no currency field of their own
      const c = empty ? '' : String(raw).trim().toUpperCase()
      if (c && !CUR.includes(c)) return { error: `${key} must be one of: ${CUR.join(', ')}.` }
      out[key] = c
      continue
    }
    if (kind === 'num') {
      const n = empty ? 0 : Number(raw)
      if (!Number.isFinite(n) || n < 0 || n > 1e12) return { error: `${key} must be a non-negative number.` }
      out[key] = n
      continue
    }
    const v = empty ? '' : String(raw).trim()
    if (v.length > 2000) return { error: `${key} is too long.` }
    if (kind === 'date' && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { error: `${key} must be a date (YYYY-MM-DD).` }
    if (kind === 'url' && v && !isHttpUrl(v)) return { error: `${key} must be a valid http or https URL.` }
    out[key] = v
  }
  return { data: out }
}

const SETTING_STRINGS = ['name', 'workspace', 'creatorType', 'niche', 'primaryGoal', 'audienceSize']
const SETTING_LISTS = ['revenueStreams', 'platforms']

export function cleanSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Invalid request body.' }
  const out = {}
  for (const k of SETTING_STRINGS) if (k in input) {
    const v = String(input[k] ?? '').trim()
    if (v.length > 200) return { error: `${k} is too long.` }
    if ((k === 'name' || k === 'workspace') && !v) return { error: `${k} cannot be empty.` }
    out[k] = v
  }
  for (const k of SETTING_LISTS) if (k in input) {
    if (!Array.isArray(input[k]) || input[k].length > 30) return { error: `${k} must be a short list.` }
    out[k] = input[k].map((x) => String(x).trim().slice(0, 60)).filter(Boolean)
  }
  if ('currency' in input) {
    if (!CUR.includes(input.currency)) return { error: `currency must be one of: ${CUR.join(', ')}.` }
    out.currency = input.currency
  }
  if ('onboardingComplete' in input) out.onboardingComplete = input.onboardingComplete === true
  const email = 'email' in input ? String(input.email).trim().toLowerCase() : undefined
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: 'Enter a valid email address.' }
  return { data: out, email }
}
