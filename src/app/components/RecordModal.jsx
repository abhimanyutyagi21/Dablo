import { useEffect, useRef, useState } from 'react'
import { definitions } from '../definitions'
import { revenueModel } from '../selectors'
import { useStore } from '../store'
import { Notice } from './common'
import { num, today, uid } from '../utils'

const WIDE = ['url', 'notes', 'description', 'structure', 'evidence']
const STAMPED = ['content', 'links', 'campaigns'] // amounts on these records have no currency field, so we remember one
const httpUrl = (v) => { try { return ['http:', 'https:'].includes(new URL(v).protocol) } catch { return false } }

function Field({ f, record, currency, cur }) {
  const [key, label, type, required, opts] = f
  const val = record[key] ?? (type === 'date' && ['date', 'published', 'start'].includes(key) ? today() : type === 'select' && key === 'currency' ? currency : '')
  const wide = type === 'textarea' || WIDE.includes(key)
  const unit = cur && ['revenue', 'budget'].includes(key) ? ` (${cur})` : ''
  return (
    <label className={'form-label' + (wide ? ' wide' : '')}>
      {label}{unit}
      {type === 'select' ? <select name={key} required={required} defaultValue={val}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
        : type === 'textarea' ? <textarea name={key} required={required} defaultValue={val} />
        : <input name={key} type={type} required={required} defaultValue={val} {...(type === 'number' ? { min: 0, step: 'any' } : {})} {...(type === 'url' ? { placeholder: 'https://' } : {})} />}
    </label>
  )
}

// Shows how the revenue total changes while the form is being filled in, before anything is saved.
function LivePreview({ modal, draft }) {
  const { data, conv, money, settings } = useStore()
  if (!['revenue', 'content'].includes(modal.type)) return null
  const rec = modal.record || {}
  const cols = data.collections
  const swap = (list, item) => (rec.id ? list.map((x) => (x.id === rec.id ? item : x)) : [item, ...list])
  const next = modal.type === 'revenue'
    ? { ...cols, revenue: swap(cols.revenue, { ...rec, ...draft, amount: num(draft.amount), id: rec.id || 'draft' }) }
    : { ...cols, content: swap(cols.content, { ...rec, ...draft, revenue: num(draft.revenue), currency: rec.currency || settings.currency, id: rec.id || 'draft' }) }
  const before = revenueModel(cols, conv).total
  const after = revenueModel(next, conv).total
  const diff = after - before
  return (
    <Notice mark="↗" title="Live revenue total">
      {money(before)} now, {money(after)} after saving{Math.abs(diff) > 0.004 ? ` (${diff > 0 ? '+' : '-'}${money(Math.abs(diff))})` : ' (no change)'}
    </Notice>
  )
}

// Add / edit dialog shared by every record type.
export default function RecordModal({ modal, onClose }) {
  const ref = useRef(null)
  const { saveRecord, settings } = useStore()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(null)

  useEffect(() => {
    const d = ref.current
    if (modal && !d.open) { setError(''); setDraft(null); d.showModal() }
    if (!modal && d.open) d.close()
  }, [modal])

  const def = modal && definitions[modal.type]
  const record = modal?.record || {}
  const stamp = modal && STAMPED.includes(modal.type) ? (record.currency || settings.currency || 'USD') : ''

  async function submit(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const obj = {}
    for (const f of def.fields) obj[f[0]] = f[2] === 'number' ? num(fd.get(f[0])) : String(fd.get(f[0]) || '').trim()
    const missing = def.fields.find((f) => f[3] && !String(obj[f[0]] ?? '').trim())
    if (missing) return setError(`${missing[1]} is required.`)
    if (modal.type === 'links') {
      if (!httpUrl(obj.destination)) return setError('Enter a valid http or https destination URL.')
      obj.slug = (obj.slug || obj.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || uid('link')).slice(0, 70)
    }
    if (modal.type === 'content' && obj.url && !httpUrl(obj.url)) return setError('Enter a valid http or https content URL.')
    if (stamp) obj.currency = stamp
    setSaving(true); setError('')
    const err = await saveRecord(modal.type, obj, record.id)
    setSaving(false)
    if (err) setError(err)
    else onClose()
  }

  return (
    <dialog className="modal" ref={ref} onClose={onClose}>
      {modal && (
        <form onSubmit={submit} noValidate={false} onInput={(e) => setDraft(Object.fromEntries(new FormData(e.currentTarget).entries()))}>
          <div className="modal-head">
            <div><span className="eyebrow">{def.label.toUpperCase()}</span><h2>{record.id ? 'Edit ' : 'Add '}{def.singular}</h2></div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">×</button>
          </div>
          <div className="form-grid">{def.fields.map((f) => <Field key={f[0]} f={f} record={record} currency={settings.currency || 'USD'} cur={stamp} />)}</div>
          {draft && <LivePreview modal={modal} draft={draft} />}
          <p className="form-error" role="alert">{error}</p>
          <div className="modal-actions">
            <button type="button" className="button ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={saving}>{record.id ? 'Save changes ↗' : 'Save record ↗'}</button>
          </div>
        </form>
      )}
    </dialog>
  )
}
