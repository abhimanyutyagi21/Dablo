// CSV parsing and row cleaning for the import dialog. Everything here is pure (no React).
const CODES = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD']
const MONEY_KEYS = ['amount', 'revenue', 'budget', 'price']

export function parseCSV(input) {
  const text = String(input).replace(/^\uFEFF/, '')
  const first = text.split(/\r?\n/, 1)[0] || ''
  const delim = [',', ';', '\t'].map((d) => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0]
  const rows = []
  let row = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++ } else quoted = false }
      else cell += ch
    } else if (ch === '"' && cell === '') quoted = true
    else if (ch === delim) { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ''))
}

// "₹1,23,456.50", "$1,200", "1.234,56", "(50)" -> { value, currency }
export function parseAmount(raw) {
  const s0 = String(raw ?? '').trim()
  if (!s0) return { value: null, currency: '' }
  let currency = ''
  const code = s0.match(/\b(USD|INR|EUR|GBP|CAD|AUD)\b/i)
  if (code) currency = code[1].toUpperCase()
  else if (/₹|\bRs\.?/i.test(s0)) currency = 'INR'
  else if (s0.includes('€')) currency = 'EUR'
  else if (s0.includes('£')) currency = 'GBP'
  else if (s0.includes('$')) currency = 'USD'
  const negative = s0.includes('-') || /^\(.*\)$/.test(s0)
  let s = s0.replace(/[^\d.,]/g, '')
  const dot = s.lastIndexOf('.'), comma = s.lastIndexOf(',')
  if (dot >= 0 && comma >= 0) {
    const dec = dot > comma ? '.' : ',', thousands = dec === '.' ? ',' : '.'
    s = s.split(thousands).join('').replace(dec, '.')
  } else if (comma >= 0) {
    s = /,\d{1,2}$/.test(s) && s.indexOf(',') === comma ? s.replace(',', '.') : s.replace(/,/g, '')
  } else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '')
  const n = Number(s)
  if (s === '' || !Number.isFinite(n)) return { value: null, currency }
  return { value: negative ? -n : n, currency }
}

export function parseDate(raw, dayFirst = true) {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  const ymd = (y, mo, d) => {
    const dt = new Date(Date.UTC(y, mo - 1, d))
    const ok = dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d
    return ok ? `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}` : ''
  }
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (m) return ymd(+m[1], +m[2], +m[3])
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/)
  if (m) {
    const a = +m[1], b = +m[2]
    let y = +m[3]
    if (y < 100) y += 2000
    const [d, mo] = a > 12 ? [a, b] : b > 12 ? [b, a] : dayFirst ? [a, b] : [b, a]
    return ymd(y, mo, d)
  }
  const t = Date.parse(s)
  if (!Number.isNaN(t)) { const d = new Date(t); return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate()) }
  return ''
}

const normCurrency = (raw) => {
  const s = String(raw ?? '').trim().toUpperCase()
  if (CODES.includes(s)) return s
  return { '$': 'USD', '₹': 'INR', '€': 'EUR', '£': 'GBP', RS: 'INR', 'RS.': 'INR' }[s] || ''
}

// Header text -> field. Matching ignores case, spaces and punctuation.
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const ALIASES = {
  title: ['title', 'name', 'recordname', 'description', 'item', 'memo', 'video', 'videotitle', 'post', 'headline', 'content'],
  name: ['name', 'title', 'campaign', 'campaignname', 'product', 'productname', 'offer'],
  amount: ['amount', 'revenue', 'earnings', 'income', 'total', 'value', 'payout', 'estimatedrevenue'],
  currency: ['currency', 'cur', 'ccy'],
  date: ['date', 'paidon', 'day', 'transactiondate', 'paymentdate', 'received'],
  published: ['published', 'publishedon', 'publishdate', 'publishedat', 'postdate', 'date', 'uploaded'],
  start: ['start', 'startdate', 'from'], end: ['end', 'enddate', 'to'],
  views: ['views', 'viewcount', 'impressions', 'plays'], clicks: ['clicks', 'linkclicks'],
  conversions: ['conversions', 'sales', 'orders'],
  revenue: ['revenue', 'earnings', 'income', 'attributedrevenue', 'amount'],
  url: ['url', 'link', 'contenturl', 'permalink'],
  platform: ['platform', 'channel', 'network', 'site'],
  source: ['source', 'type', 'category', 'revenuesource'],
  reference: ['reference', 'transactionid', 'txnid', 'id', 'invoice', 'orderid'],
  budget: ['budget', 'spend', 'cost'], price: ['price', 'cost', 'amount'],
  notes: ['notes', 'note', 'comments'], tags: ['tags', 'labels'],
}

export function guessMapping(fields, headers) {
  const h = headers.map(norm), used = new Set(), map = {}
  const take = (key, names) => {
    const i = h.findIndex((x, j) => !used.has(j) && x && names.includes(x))
    if (i < 0) return
    map[key] = i
    used.add(i)
  }
  for (const [key, label] of fields) take(key, [norm(key), norm(label)])
  for (const [key] of fields) if (map[key] === undefined) take(key, ALIASES[key] || [])
  for (const [key] of fields) if (map[key] === undefined) map[key] = -1
  return map
}

const fallbackSelect = (key, required, options, opts) => {
  if (key === 'attribution') return opts.attribution
  if (!required) return ''
  if ((options || []).includes('Other')) return 'Other'
  return (options || [])[0] || ''
}

// Turn parsed CSV rows into clean record objects. Rows that cannot be used are reported in `problems`.
export function buildRows(fields, table, map, opts) {
  const rows = [], problems = []
  const hasCurrencyField = fields.some((f) => f[0] === 'currency')
  table.rows.forEach((cells, i) => {
    const obj = {}
    let err = ''
    let detected = ''
    for (const [key, label, kind, required, options] of fields) {
      if (key === 'currency') continue
      const idx = map[key] ?? -1
      const raw = idx >= 0 ? String(cells[idx] ?? '').trim() : ''
      if (kind === 'number') {
        if (!raw) { if (required) err ||= `${label} is missing`; obj[key] = 0; continue }
        const a = parseAmount(raw)
        if (a.value === null) { err ||= `${label} is not a number`; continue }
        if (a.value < 0) { err ||= `${label} cannot be negative`; continue }
        obj[key] = a.value
        if (MONEY_KEYS.includes(key) && a.currency && !detected) detected = a.currency
      } else if (kind === 'date') {
        const d = raw ? parseDate(raw, opts.dayFirst) : ''
        if (raw && !d) { err ||= `${label} is not a valid date`; continue }
        if (required && !d) { err ||= `${label} is missing`; continue }
        obj[key] = d
      } else if (kind === 'select') {
        const hit = (options || []).find((o) => o.toLowerCase() === raw.toLowerCase())
        obj[key] = hit || fallbackSelect(key, required, options, opts)
      } else {
        let v = raw
        if (kind === 'url' && v && !/^https?:\/\//i.test(v)) v = /^[\w-]+(\.[\w-]+)+/.test(v) ? `https://${v}` : ''
        if (required && !v) { err ||= `${label} is missing`; continue }
        obj[key] = v
      }
    }
    let cur = ''
    if (hasCurrencyField && (map.currency ?? -1) >= 0) {
      const rawCur = String(cells[map.currency] ?? '').trim()
      cur = normCurrency(rawCur)
      if (rawCur && !cur) err ||= `Unsupported currency ${rawCur}`
    }
    obj.currency = cur || detected || opts.currency
    if (err) problems.push({ row: i + 2, error: err })
    else rows.push(obj)
  })
  return { rows, problems }
}
