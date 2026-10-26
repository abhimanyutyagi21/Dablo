import { useState } from 'react'
import { COLUMNS, definitions, DESCRIPTIONS, FILTERS } from '../definitions'
import { CreateButton, Empty, Heading, Metric, Notice, useUI } from '../components/common'
import ImportModal from '../components/ImportModal'
import { revenueModel } from '../selectors'
import { useStore, useToast } from '../store'
import { download, fmtMoney, toCSV, today } from '../utils'

export function useExportCSV() {
  const { data } = useStore()
  const toast = useToast()
  return (type) => {
    const rows = data.collections[type]
    if (!rows.length) return toast('There are no records to export.', true)
    download(toCSV(rows), `dablo-${type}-${today()}.csv`, 'text/csv;charset=utf-8;')
    toast(`${definitions[type].label} CSV exported.`)
  }
}

const SOURCES = { youtube: 'YouTube', twitch: 'Twitch', rss: 'RSS feed' }

function Cell({ type, k, r }) {
  const { money, fmtNum, settings } = useStore()
  const v = r[k]
  if (['amount', 'revenue', 'budget', 'price'].includes(k)) {
    const native = r.currency && r.currency !== settings.currency ? `Entered as ${fmtMoney(v, r.currency)}` : undefined
    return <span className="money" title={native}>{money(v, r.currency)}</span>
  }
  if (['views', 'clicks', 'conversions'].includes(k)) return fmtNum(v)
  if (k === 'title' || k === 'name') return <span className="td-title">{v || 'Untitled'}<small className="td-sub">{r.synced ? `Synced from ${SOURCES[r.synced] || r.synced}` : r.url || r.description || r.notes || ''}</small></span>
  if (k === 'status' || k === 'attribution') return <span className={'status-pill' + (['Paused', 'Unattributed', 'Draft', 'Planning'].includes(v) ? ' warn' : '')}>{v || 'Not set'}</span>
  if (k === 'slug') return <code>{v ? `/r/${v}` : '—'}</code>
  return v || '—'
}

// Public short-link URL. In dev it goes through the Vite proxy; in production set VITE_LINK_BASE if links live on another domain.
const LINK_BASE = (import.meta.env.VITE_LINK_BASE || window.location.origin).replace(/\/$/, '')
const shortUrl = (slug) => `${LINK_BASE}/r/${encodeURIComponent(slug)}`

async function copyLink(l, toast) {
  try { await navigator.clipboard.writeText(shortUrl(l.slug)); toast('Tracking link copied.') }
  catch { toast(`Copy failed. Your link is ${shortUrl(l.slug)}`, true) }
}

// Generic table page for content, revenue, tracking links and campaigns.
export default function CollectionPage({ type }) {
  const { data, money, fmtNum, conv, deleteRecord } = useStore()
  const { openForm } = useUI()
  const toast = useToast()
  const exportCSV = useExportCSV()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('')
  const [importing, setImporting] = useState(false)
  const def = definitions[type], records = data.collections[type], cols = COLUMNS[type]
  const shown = records.filter((r) => (!q || Object.values(r).join(' ').toLowerCase().includes(q.toLowerCase())) && (!filter || (r.status || r.platform || r.attribution || '') === filter))
  const rev = data.collections.revenue
  const isRev = type === 'revenue'
  const model = revenueModel(data.collections, conv)
  const canImport = ['content', 'revenue', 'campaigns'].includes(type)

  return (<>
    <Heading title={def.label} desc={isRev ? 'Record money once. Associate it with content only when the evidence supports it.' : DESCRIPTIONS[type]}>
      {isRev ? <CreateButton type="revenue" label="Record revenue" /> : <CreateButton type={type} label={`Add ${def.singular}`} />}
    </Heading>
    {isRev && <>
      <div className="metric-grid">
        <Metric featured label="Recorded total" value={money(model.total)} foot={model.contentTotal > 0 ? `${rev.length} records + ${money(model.contentTotal)} from content` : `${rev.length} saved records`} />
        <Metric label="Attributed" value={money(model.attributed)} foot="Attributed + manually associated" />
        <Metric label="Unattributed" value={money(model.unattributed)} foot="Needs evidence or review" />
        <Metric label="Revenue records" value={fmtNum(rev.length)} foot="Not deduplicated by transaction reference" />
      </div>
      <Notice mark="i" title="How totals work">The recorded total sums each saved revenue record exactly once. Content and campaign associations do not add a second transaction. Amounts in other currencies are converted to your display currency using daily exchange rates. Revenue typed on a content item is included only when no revenue record is linked to that content, so nothing is counted twice.</Notice>
    </>}
    <section className="panel table-panel">
      <div className="table-toolbar">
        <h3>{records.length} {records.length === 1 ? 'record' : 'records'}</h3>
        <div className="table-controls">
          <div className="search-field"><span>⌕</span><input className="input-control" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${def.label.toLowerCase()}…`} /></div>
          <select className="select-control" aria-label="Filter records" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All records</option>{FILTERS[type].map((o) => <option key={o}>{o}</option>)}
          </select>
          <button className="button ghost" onClick={() => exportCSV(type)}>↓ CSV</button>
          {canImport && <button className="button ghost" onClick={() => setImporting(true)}>↑ Import CSV</button>}
        </div>
      </div>
      <div className="table-scroll"><table>
        <thead><tr>{cols.map((c) => <th key={c[0]}>{c[1].toUpperCase()}</th>)}<th>UPDATED</th><th>ACTIONS</th></tr></thead>
        <tbody>
          {!records.length ? (
            <tr><td colSpan={cols.length + 2}><Empty title={`No ${def.label.toLowerCase()} yet`} desc={`Add your first ${def.singular} to get started.`}><CreateButton type={type} label={`Add ${def.singular}`} /></Empty></td></tr>
          ) : shown.map((r) => (
            <tr key={r.id}>
              {cols.map(([k]) => <td key={k}><Cell type={type} k={k} r={r} /></td>)}
              <td>{(r.createdAt || r.date || r.published || '—').slice(0, 10)}</td>
              <td><div className="table-actions">
                <button className="tiny-action" onClick={() => openForm(type, r)}>Edit</button>
                <button className="tiny-action" aria-label="Delete record" onClick={() => deleteRecord(type, r.id)}>×</button>
                {type === 'links' && <>
                  <button className="tiny-action" onClick={() => copyLink(r, toast)}>Copy</button>
                  <a className="tiny-action" href={shortUrl(r.slug)} target="_blank" rel="noopener noreferrer" title="Opening the link counts as a click">Open ↗</a>
                </>}
              </div></td>
            </tr>))}
        </tbody>
      </table></div>
      <div className="table-toolbar">
        <span className="muted" style={{ fontSize: 10 }}>{q || filter ? `Showing ${shown.length} of ${records.length} records` : `Showing ${records.length} records`}</span>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>Saved records</span>
      </div>
    </section>
    {canImport && <ImportModal type={type} open={importing} onClose={() => setImporting(false)} />}
  </>)
}
