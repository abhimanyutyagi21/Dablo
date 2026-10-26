import { useEffect, useRef, useState } from 'react'
import { COLUMNS, CURRENCIES, definitions } from '../definitions'
import { buildRows, guessMapping, parseCSV } from '../csv'
import { useStore } from '../store'

const MAX_ROWS = 1000
const ATTRIBUTION = ['Attributed', 'Manually associated', 'Unattributed', 'Estimated']

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

  useEffect(() => {
    const d = ref.current
    if (open && !d.open) {
      setTable(null); setFileName(''); setMap({}); setError(''); setResult(null); setBusy(false)
      setOpts((o) => ({ ...o, currency: settings.currency || 'USD' }))
      d.showModal()
    }
    if (!open && d.open) d.close()
  }, [open]) // eslint-disable-line

  async function onFile(e) {
    const file = e.target.files?.[0]
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

  async function run() {
    if (!built || !built.rows.length) return setError('There are no valid rows to import.')
    setBusy(true); setError('')
    const out = await importRows(type, built.rows)
    setBusy(false)
    if (out.error) setError(out.error)
    else setResult(out.result)
  }

  return (
    <dialog className="modal" ref={ref} onClose={onClose}>
      {open && (
        <div>
          <div className="modal-head">
            <div><span className="eyebrow">IMPORT CSV</span><h2>Import {def.label.toLowerCase()}</h2></div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">×</button>
          </div>

          {result ? (<>
            <p><b>{result.created}</b> {result.created === 1 ? 'record was' : 'records were'} imported.
              {result.duplicates > 0 && <> {result.duplicates} already existed and were skipped.</>}
              {result.invalid > 0 && <> {result.invalid} could not be imported.</>}</p>
            {result.errors.length > 0 && <ul className="muted" style={{ fontSize: 12 }}>{result.errors.map((x, i) => <li key={i}>Row {x.row}: {x.error}</li>)}</ul>}
            <div className="modal-actions"><button type="button" className="button primary" onClick={onClose}>Done</button></div>
          </>) : !table ? (<>
            <p>Choose a CSV file exported from a spreadsheet or another tool. The first row must contain column names. You can check how the columns match before anything is imported.</p>
            <p className="muted" style={{ fontSize: 12 }}>Tip: use the CSV export on this page to see the expected columns. Importing the same file twice will not create duplicates.</p>
            <input type="file" accept=".csv,.txt,text/csv" onChange={onFile} />
            <p className="form-error" role="alert">{error}</p>
            <div className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>Cancel</button></div>
          </>) : (<>
            <p><b>{fileName}</b>: {table.rows.length} rows, {built.rows.length} ready to import{built.problems.length > 0 ? `, ${built.problems.length} with problems` : ''}.</p>
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
            <div className="form-grid" style={{ marginTop: 10 }}>
              <label className="form-label">Currency when a row has none
                <select value={opts.currency} onChange={(e) => setOpts((o) => ({ ...o, currency: e.target.value }))}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
              <label className="form-label">Dates like 03/04/2026 mean
                <select value={opts.dayFirst ? 'dmy' : 'mdy'} onChange={(e) => setOpts((o) => ({ ...o, dayFirst: e.target.value === 'dmy' }))}>
                  <option value="dmy">3 April (day first)</option><option value="mdy">March 4 (month first)</option>
                </select>
              </label>
              {type === 'revenue' && (
                <label className="form-label">Attribution when a row has none
                  <select value={opts.attribution} onChange={(e) => setOpts((o) => ({ ...o, attribution: e.target.value }))}>{ATTRIBUTION.map((a) => <option key={a}>{a}</option>)}</select>
                </label>
              )}
            </div>
            <div className="table-scroll" style={{ marginTop: 12 }}><table>
              <thead><tr>{cols.map(([k, l]) => <th key={k}>{l.toUpperCase()}</th>)}</tr></thead>
              <tbody>{built.rows.slice(0, 5).map((r, i) => <tr key={i}>{cols.map(([k]) => <td key={k}>{String(r[k] ?? '') || '-'}</td>)}</tr>)}</tbody>
            </table></div>
            {built.problems.length > 0 && <ul className="muted" style={{ fontSize: 12 }}>{built.problems.slice(0, 3).map((p) => <li key={p.row}>Row {p.row}: {p.error}</li>)}{built.problems.length > 3 && <li>and {built.problems.length - 3} more</li>}</ul>}
            <p className="form-error" role="alert">{error}</p>
            <div className="modal-actions">
              <button type="button" className="button ghost" onClick={() => { setTable(null); setError('') }}>Choose another file</button>
              <button type="button" className="button primary" disabled={busy || !built.rows.length} onClick={run}>{busy ? 'Importing' : `Import ${built.rows.length} rows ↗`}</button>
            </div>
          </>)}
        </div>
      )}
    </dialog>
  )
}
