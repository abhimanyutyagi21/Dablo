import { useEffect, useState } from 'react'
import { api } from '../api'
import { useToast } from '../store'

const List = ({ title, items }) => items?.length ? (
  <div style={{ marginTop: 12 }}><b style={{ fontSize: 11, letterSpacing: '.08em' }}>{title}</b>
    <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
) : null

// Plain-language summary written by Claude from aggregated numbers only (names are anonymised unless ticked).
export default function AiSummary() {
  const toast = useToast()
  const [state, setState] = useState({ loading: true })
  const [includeTitles, setIncludeTitles] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => { api.get('/insights/summary').then((r) => setState(r)).catch((e) => setState({ error: e.message })) }, [])

  async function generate() {
    setBusy(true)
    try {
      const r = await api.post('/insights/summary', { includeTitles })
      setState((s) => ({ ...s, ...r, configured: true }))
      if (r.cached) toast('Nothing changed since the last summary, so this is the saved one.')
    } catch (e) { toast(e.message, true) }
    setBusy(false)
  }

  const s = state.summary
  return (
    <section className="panel" style={{ marginBottom: 15 }}>
      <div className="panel-head"><div><h3>AI summary</h3><p>A plain-language read of your numbers, written by Claude.</p></div><span className="tag">AI-GENERATED</span></div>
      {state.loading ? null : state.configured === false ? (
        <p className="muted" style={{ fontSize: 12 }}>AI summaries are switched off. Add <code>ANTHROPIC_API_KEY</code> to <code>server/.env</code> and restart the server to enable them.</p>
      ) : (<>
        {s ? (
          <article className="insight-card" style={{ display: 'block' }}>
            <h3>{s.headline}</h3><p>{s.summary}</p>
            <List title="HIGHLIGHTS" items={s.highlights} /><List title="WATCH OUT FOR" items={s.watchouts} /><List title="NEXT STEPS" items={s.nextSteps} />
            <span className="evidence" style={{ display: 'block', marginTop: 12 }}>Generated {new Date(state.createdAt).toLocaleString()} · {state.model}</span>
          </article>
        ) : <p className="muted" style={{ fontSize: 12 }}>No summary yet. Generate one from your current records.</p>}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          <button className="button primary" onClick={generate} disabled={busy}>{busy ? 'Writing…' : s ? 'Refresh summary' : 'Generate summary'} ✳</button>
          <label style={{ fontSize: 11.5, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={includeTitles} onChange={(e) => setIncludeTitles(e.target.checked)} /> Include content titles
          </label>
        </div>
        <p className="muted" style={{ fontSize: 10.5, marginTop: 10 }}>Only totals and rankings are sent to the AI. Titles and link names are replaced with “Content #1” unless you tick the box. AI can be wrong: check the numbers before acting.</p>
      </>)}
      {state.error && <p className="form-error">{state.error}</p>}
    </section>
  )
}
