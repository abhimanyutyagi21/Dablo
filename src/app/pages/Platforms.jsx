import { useSearchParams } from 'react-router-dom'
import { PLATFORMS } from '../definitions'
import { CreateButton, Empty, Heading, Metric, Notice, useUI } from '../components/common'
import { platformRevenueRecords } from '../selectors'
import { useStore } from '../store'
import Connections from './Connections'
import { isAttributed, sumBy } from '../utils'

function PlatformCard({ p, onOpen }) {
  const { data, money, fmtNum, sumMoney } = useStore()
  const content = data.collections.content.filter((c) => c.platform === p)
  const records = platformRevenueRecords(data, p)
  return (
    <article className="platform-card">
      <div className="platform-card-top"><span className="platform-mark">{p.slice(0, 1)}</span><span className="tag">{content.length} CONTENT</span></div>
      <h3>{p}</h3><div className="platform-revenue">{money(sumMoney(records, 'amount'))}</div>
      <small className="platform-muted">Recorded revenue linked to {p}</small>
      <div className="platform-mini-grid">
        <div><small>ATTRIBUTED</small><b>{money(sumMoney(records.filter(isAttributed), 'amount'))}</b></div>
        <div><small>VIEWS</small><b>{fmtNum(sumBy(content, 'views'))}</b></div>
        <div><small>CLICKS</small><b>{fmtNum(sumBy(content, 'clicks'))}</b></div>
        <div><small>CONVERSIONS</small><b>{fmtNum(sumBy(content, 'conversions'))}</b></div>
      </div>
      <button className="button ghost full" onClick={() => onOpen(p)}>Open {p} details ↗</button>
    </article>
  )
}

function Detail({ p, onOpen }) {
  const { data, money, fmtNum, sumMoney } = useStore()
  const { openForm } = useUI()
  const content = data.collections.content.filter((c) => c.platform === p)
  const records = platformRevenueRecords(data, p)
  return (<>
    <Heading title={`${p} earnings`} desc={`A focused view of your ${p} content, recorded income and attribution.`}>
      <button className="button ghost" onClick={() => onOpen(null)}>← All platforms</button>
      <CreateButton type="content" label="Add content" /><CreateButton type="revenue" label="Record revenue" />
    </Heading>
    <div className="metric-grid">
      <Metric featured label="Recorded revenue" value={money(sumMoney(records, 'amount'))} foot={`${records.length} associated records`} />
      <Metric label="Content items" value={fmtNum(content.length)} foot="Saved content on this platform" />
      <Metric label="Views" value={fmtNum(sumBy(content, 'views'))} foot="Manually recorded metrics" />
      <Metric label="Content-level revenue" value={money(sumMoney(content, 'revenue'))} foot="Shown separately; not added to recorded revenue" />
    </div>
    <Notice mark="i" title="Keep transaction totals distinct.">Platform revenue sums revenue records assigned to this platform (or linked through a content title). Content-level revenue is displayed separately and is not added again.</Notice>
    <div className="section-title"><div><h2>{p} content</h2><p>Performance fields are manually entered until data providers are connected.</p></div><CreateButton type="content" label="Add content" /></div>
    {content.length ? (
      <section className="panel table-panel"><div className="table-scroll"><table>
        <thead><tr><th>CONTENT</th><th>PUBLISHED</th><th>VIEWS</th><th>CLICKS</th><th>CONVERSIONS</th><th>CONTENT REVENUE</th><th>ACTIONS</th></tr></thead>
        <tbody>{content.map((c) => (
          <tr key={c.id}><td className="td-title">{c.title}</td><td>{c.published || '—'}</td><td>{fmtNum(c.views)}</td><td>{fmtNum(c.clicks)}</td><td>{fmtNum(c.conversions)}</td>
            <td className="money">{money(c.revenue, c.currency)}</td><td><button className="tiny-action" onClick={() => openForm('content', c)}>Edit</button></td></tr>))}</tbody>
      </table></div></section>
    ) : <Empty title="No content yet" desc={`Add a content record and choose ${p} as its platform.`}><CreateButton type="content" label="Add content" /></Empty>}
    <div className="section-title"><div><h2>Revenue records</h2><p>Transactions assigned to {p}.</p></div><CreateButton type="revenue" label="Record revenue" /></div>
    {records.length ? (
      <section className="panel table-panel"><div className="table-scroll"><table>
        <thead><tr><th>RECORD</th><th>DATE</th><th>SOURCE</th><th>ATTRIBUTION</th><th>AMOUNT</th></tr></thead>
        <tbody>{records.map((r) => (
          <tr key={r.id}><td className="td-title">{r.title}</td><td>{r.date || '—'}</td><td>{r.source || '—'}</td><td>{r.attribution || '—'}</td><td className="money">{money(r.amount, r.currency)}</td></tr>))}</tbody>
      </table></div></section>
    ) : <Empty title="No revenue assigned yet" desc="Assign a platform to revenue records or associate a revenue record with content on this platform."><CreateButton type="revenue" label="Record revenue" /></Empty>}
  </>)
}

// The selected platform lives in the URL (?platform=YouTube) so it survives refresh and back/forward.
export default function Platforms() {
  const [params, setParams] = useSearchParams()
  const chosen = params.get('platform')
  const open = (p) => setParams(p ? { platform: p } : {})
  if (chosen && PLATFORMS.includes(chosen)) return <Detail p={chosen} onOpen={open} />
  return (<>
    <Heading title="Platforms & earnings" desc="See each platform on its own. Overall totals stay in Overview; these views help you understand where content and revenue are recorded.">
      <CreateButton type="content" label="Add content" />
    </Heading>
    <Notice title="One workspace, separate platform views.">Revenue is counted from revenue records only. Content-level revenue is displayed separately to avoid double counting. Review each platform’s recorded performance in one place.</Notice>
    <Connections />
    <div className="section-title"><div><h2>Your platforms</h2><p>Recorded content and revenue for each platform.</p></div></div>
    <div className="platform-grid">{PLATFORMS.map((p) => <PlatformCard key={p} p={p} onOpen={open} />)}</div>
  </>)
}
