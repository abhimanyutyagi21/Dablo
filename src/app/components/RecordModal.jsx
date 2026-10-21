import { useEffect, useRef, useState } from 'react'
import { definitions } from '../definitions'
import { useStore } from '../store'
import { num, today, uid } from '../utils'

const WIDE = ['url', 'notes', 'description', 'structure', 'evidence']
const httpUrl = (v) => { try { return ['http:', 'https:'].includes(new URL(v).protocol) } catch { return false } }

function Field({ f, record, currency }) {
  const [key, label, type, required, opts] = f
  const val = record[key] ?? (type === 'date' && ['date', 'published', 'start'].includes(key) ? today() : type === 'select' && key === 'currency' ? currency : '')
  const wide = type === 'textarea' || WIDE.includes(key)
  return (
    <label className={'form-label' + (wide ? ' wide' : '')}>
      {label}
      {type === 'select' ? <select name={key} required={required} defaultValue={val}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
        : type === 'textarea' ? <textarea name={key} required={required} defaultValue={val} />
        : <input name={key} type={type} required={required} defaultValue={val} {...(type === 'number' ? { min: 0, step: 'any' } : {})} {...(type === 'url' ? { placeholder: 'https://' } : {})} />}
    </label>
  )
}

// Add / edit dialog shared by every record type.
export default function RecordModal({ modal, onClose }) {
  const ref = useRef(null)
  const { saveRecord, settings } = useStore()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (modal && !d.open) { setError(''); d.showModal() }
    if (!modal && d.open) d.close()
  }, [modal])

  const def = modal && definitions[modal.type]
  const record = modal?.record || {}

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
    setSaving(true); setError('')
    const err = await saveRecord(modal.type, obj, record.id)
    setSaving(false)
    if (err) setError(err)
    else onClose()
  }

  return (
    <dialog className="modal" ref={ref} onClose={onClose}>
      {modal && (
        <form onSubmit={submit} noValidate={false}>
          <div className="modal-head">
            <div><span className="eyebrow">{def.label.toUpperCase()}</span><h2>{record.id ? 'Edit ' : 'Add '}{def.singular}</h2></div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">×</button>
          </div>
          <div className="form-grid">{def.fields.map((f) => <Field key={f[0]} f={f} record={record} currency={settings.currency || 'USD'} />)}</div>
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
