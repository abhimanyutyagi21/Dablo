export const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
export const fmtNum = (v) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num(v))
export const fmtMoney = (v, currency = 'USD') => {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(num(v)) }
  catch { return '$' + num(v).toFixed(2) }
}
const pad = (n) => String(n).padStart(2, '0')
// Local-time date helpers (toISOString() would shift the date for users east of UTC).
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
export const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
export const uid = (prefix) => prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
export const isAttributed = (r) => r.attribution === 'Attributed' || r.attribution === 'Manually associated'
export const sumBy = (list, key) => list.reduce((s, r) => s + num(r[key]), 0)

const csvEscape = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
export function download(text, filename, mime) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: mime }))
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
export function toCSV(rows) {
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))]
  return [keys.map(csvEscape).join(','), ...rows.map((r) => keys.map((k) => csvEscape(r[k])).join(','))].join('\r\n')
}
