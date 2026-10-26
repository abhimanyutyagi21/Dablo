import { useEffect, useRef, useState } from 'react'
import { COLUMNS, CURRENCIES, definitions } from '../definitions'
import { buildRows, guessMapping, parseCSV } from '../csv'
import { useStore } from '../store'

const MAX_ROWS = 1000
const ATTRIBUTION = ['Attributed', 'Manually associated', 'Unattributed', 'Estimated']
const MONEY = ['amount', 'revenue', 'budget', 'price']

const Steps = ({ step }) => (
  <ol className="import-steps">
    {['Choose file', 'Check columns', 'Done'].map((l, i) => <li key={l} className={i === step ? 'on' : ''}>{i + 1}. {l}</li>)}
  </ol>
)

// Import existing data from a CSV file: choose a file, check how its columns map to Dablo fields, preview, import.
export default function ImportModal({ type, open, onClose }) {
  const ref = useRef(null)
  const { settings, importRows } = useStore()
  const def = definitions[type]
  const [table, setTable] = useState(null)
  const [fileName, setFileName] = useState('')
  const [map, setMap] = useState({})
  const [opts, setOpts] = useState({ currency: 'USD', dayFirst: true, attribution: 'Attributed' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [over, setOver] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (open && !d.open) {
      setTable(null); setFileName(''); setMap({}); setError(''); setResult(null); setBusy(false); setOver(false)
      setOpts((o) => ({ ...o, currency: settings.currency || 'USD' }))
      d.showModal()
    }
    if (!open && d.open) d.close()
  }, [open]) // eslint-disable-line

  async function readFile(file) {
    if (!file) return
    setError('')
    if (file.size > 5 * 1024 * 1024) return setError('That file is larger than 5 MB.')
    const all = parseCSV(await file.text())
    if (all.length < 2) return setError('The file needs a header row and at least one row of data.')
    if (all.length - 1 > MAX_ROWS) return setError(`This file has ${all.length - 1} rows. Import up to ${MAX_ROWS} rows at a time by splitting the file.`)
    const headers = all[0].map((h) => String(h).trim())
    setFileName(file.name)
    setTable({ headers, rows: all.slice(1) })
    setMap(guessMapping(def.fields, headers))
  }

  const built = table ? buildRows(def.fields, table, map, opts) : null
  const cols = COLUMNS[type] || def.fields.slice(0, 5).map((f) => [f[0], f[1]])
  const matched = def.fields.filter((f) => (map[f[0]] ?? -1) >= 0).length
  const missing = def.fields.filter((f) => f[3] && f[2] !== 'select' && f[0] !== 'currency' && (map[f[0]] ?? -1) < 0)
  const cell = (r, k) => (MONEY.includes(k) ? `${r[k]} ${r.currency}` : String(r[k] ?? '') || '-')

  async function run() {
    if (!built || !built.rows.length) return setError('There are no valid rows to import.')
    setBusy(true); setError('')
    const out = await importRows(type, built.rows)
    setBusy(false)
    if (out.error) setError(out.error)
    else setResult(out.result)
  }

  return (
    <dialog className={'modal' + (table && !result ? ' wide-modal' : '')} ref={ref} onClose={onClose}>
      {open && (
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="modal-head">
            <div><span className="eyebrow">IMPORT CSV</span><h2>Import {def.label.toLowerCase()}</h2></div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">×</button>
          </div>
          <Steps step={result ? 2 : table ? 1 : 0} />

          {result ? (<>
            <div className="import-stats">
              <div className="import-stat"><b>{result.created}</b><span>imported</span></div>
              <div className="import-stat"><b>{result.duplicates}</b><span>already existed</span></div>
              <div className="import-stat"><b>{result.invalid}</b><span>could not be imported</span></div>
            </div>
            {result.errors.length > 0 && <ul className="import-problems">{result.errors.map((x, i) => <li key={i}>Row {x.row}: {x.error}</li>)}</ul>}
            <div className="modal-actions"><button type="button" className="button primary" onClick={onClose}>Done</button></div>
          </>) : !table ? (<>
            <label
              className={'import-drop' + (over ? ' over' : '')}
              onDragOver={(e) => { e.preventDefault(); setOver(true) }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); readFile(e.dataTransfer.files?.[0]) }}
            >
              <input type="file" accept=".csv,.txt,text/csv" onChange={(e) => readFile(e.target.files?.[0])} />
              <span className="import-drop-icon">↑</span>
              <b>Drop your CSV file here</b>
              <small>or</small>
              <span className="button primary">Choose CSV file</span>
              <small>Up to {MAX_ROWS} rows and 5 MB. Comma, semicolon or tab separated.</small>
            </label>
            <p className="import-hint">The first row must contain column names. Use the CSV export on this page to see the expected columns. Importing the same file twice will not create duplicates.</p>
            <p className="form-error" role="alert">{error}</p>
            <div className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>Cancel</button></div>
          </>) : (<>
            <div className="import-summary">
              <span className="import-chip">{fileName}</span>
              <span className="import-chip">{table.rows.length} rows</span>
              <span className="import-chip">{built.rows.length} ready</span>
              {built.problems.length > 0 && <span className="import-chip warn">{built.problems.length} with problems</span>}
              {missing.length > 0 && <span className="import-chip warn">Needs a column for: {missing.map((f) => f[1]).join(', ')}</span>}
            </div>

            <details className="import-map" open={missing.length > 0}>
              <summary>Column matching: {matched} of {def.fields.length} fields matched. Click to change.</summary>
              <div className="form-grid">
                {def.fields.map((f) => (
                  <label className="form-label" key={f[0]}>{f[1]}{f[3] ? ' *' : ''}
                    <select value={map[f[0]] ?? -1} onChange={(e) => setMap((m) => ({ ...m, [f[0]]: Number(e.target.value) }))}>
                      <option value={-1}>Not in file</option>
                      {table.headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </details>

            <p className="import-section">Defaults for blank cells</p>
            <div className="form-grid">
              <label className="form-label">Currency
                <select value={opts.currency} onChange={(e) => setOpts((o) => ({ ...o, currency: e.target.value }))}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
              <label className="form-label">Dates like 03/04/2026 mean
                <select value={opts.dayFirst ? 'dmy' : 'mdy'} onChange={(e) => setOpts((o) => ({ ...o, dayFirst: e.target.value === 'dmy' }))}>
                  <option value="dmy">3 April (day first)</option><option value="mdy">March 4 (month first)</option>
                </select>
              </label>
              {type === 'revenue' && (
                <label className="form-label">Attribution
                  <select value={opts.attribution} onChange={(e) => setOpts((o) => ({ ...o, attribution: e.target.value }))}>{ATTRIBUTION.map((a) => <option key={a}>{a}</option>)}</select>
                </label>
              )}
            </div>

            <p className="import-section">Preview of the first 5 rows</p>
            <div className="import-preview table-scroll"><table>
              <thead><tr>{cols.map(([k, l]) => <th key={k}>{l.toUpperCase()}</th>)}</tr></thead>
              <tbody>{built.rows.slice(0, 5).map((r, i) => <tr key={i}>{cols.map(([k]) => <td key={k}>{cell(r, k)}</td>)}</tr>)}</tbody>
            </table></div>
            {built.problems.length > 0 && (
              <ul className="import-problems">
                {built.problems.slice(0, 3).map((p) => <li key={p.row}>Row {p.row}: {p.error}</li>)}
                {built.problems.length > 3 && <li>and {built.problems.length - 3} more rows with problems (they will be skipped)</li>}
              </ul>
            )}
            <p className="form-error" role="alert">{error}</p>
            <div className="modal-actions">
              <button type="button" className="button ghost" onClick={() => { setTable(null); setError('') }}>Choose another file</button>
              <button type="button" className="button primary" disabled={busy || !built.rows.length} onClick={run}>{busy ? 'Importing...' : `Import ${built.rows.length} rows ↗`}</button>
            </div>
          </>)}
        </form>
      )}
    </dialog>
  )
}
