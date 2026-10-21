import { useUI } from '../components/common'

const STEPS = [
  ['01', 'Add content', 'Start with a published video, post, newsletter or campaign asset.', 'content', 'Add content ↗'],
  ['02', 'Record revenue', 'Enter a real payout or transaction once, with a clear source.', 'revenue', 'Record revenue ↗'],
  ['03', 'Link the evidence', 'Associate the record with a content item only when you have a reasonable basis.', 'links', 'Create tracking link ↗'],
]

export default function QuickStart() {
  const { openForm } = useUI()
  return (<>
    <div className="section-title"><div><h2>Build your first useful signal</h2><p>Connect records in this order so Dablo can compare the right things.</p></div></div>
    <div className="framework-grid">
      {STEPS.map(([n, t, d, type, cta]) => (
        <article key={n} className="framework-card"><span className="card-symbol">{n}</span><h3>{t}</h3><p>{d}</p>
          <button className="button primary" onClick={() => openForm(type)}>{cta}</button></article>
      ))}
    </div>
  </>)
}
