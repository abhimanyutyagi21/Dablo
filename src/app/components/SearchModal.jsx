import { useEffect, useRef, useState } from 'react'
import { definitions } from '../definitions'
import { useStore } from '../store'
import { Empty, useGo } from './common'

export default function SearchModal({ open, onClose }) {
  const ref = useRef(null)
  const { data } = useStore()
  const go = useGo()
  const [q, setQ] = useState('')

  useEffect(() => {
    const d = ref.current
    if (open && !d.open) { setQ(''); d.showModal() }
    if (!open && d.open) d.close()
  }, [open])

  const found = q.trim()
    ? Object.keys(definitions).flatMap((t) => data.collections[t]
        .filter((r) => Object.values(r).join(' ').toLowerCase().includes(q.toLowerCase()))
        .map((r) => ({ t, r, label: r.title || r.name || r.slug || 'Record' }))).slice(0, 20)
    : []
  const pick = (t) => { onClose(); go(t) }

  return (
    <dialog className="modal search-modal" ref={ref} onClose={onClose}>
      <form method="dialog" onSubmit={(e) => e.preventDefault()}>
        <div className="search-input-wrap">
          <span>⌕</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search content, products, campaigns…" aria-label="Search workspace" autoFocus />
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close search">×</button>
        </div>
        <div className="search-results">
          {!q.trim() ? <p style={{ fontSize: 11, color: 'var(--muted)', padding: 10 }}>Type to search saved records.</p>
            : found.length ? found.map((x) => (
              <div key={x.r.id} className="search-result" role="button" tabIndex={0} onClick={() => pick(x.t)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(x.t) } }}>
                <span className="card-symbol">{definitions[x.t].icon}</span>
                <span><b>{x.label}</b><small>{definitions[x.t].label}</small></span>
              </div>))
              : <Empty title="No matching records" desc="Try a different title, platform, product or status." />}
        </div>
      </form>
    </dialog>
  )
}
