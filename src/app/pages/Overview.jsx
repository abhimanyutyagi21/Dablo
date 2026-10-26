import { useState } from 'react'
import { CreateButton, Empty, Heading, InsightCard, Metric, Notice, RevenueChart, useGo } from '../components/common'
import { insightRules, revenueModel } from '../selectors'
import { useStore } from '../store'
import { isAttributed, monthKey, num, sumBy } from '../utils'

const lastMonths = () => Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return monthKey(d) })

export default function Overview() {
  const { data, money, fmtNum, conv: convert, sumMoney } = useStore()
  const go = useGo()
  const [range, setRange] = useState('all')

  const inRange = (date) => {
    if (range === 'all') return true
    if (!date) return false
    const d = new Date(date + 'T00:00:00'), cut = new Date()
    cut.setHours(0, 0, 0, 0); cut.setDate(cut.getDate() - (Number(range) - 1))
    return d >= cut && d <= new Date()
  }
  const { content: allContent, revenue: allRev, links } = data.collections
  // Totals update the moment a record is saved: revenue records plus revenue typed on content that has no linked record.
  const model = revenueModel(data.collections, convert, inRange)
  const rev = model.recs, content = allContent.filter((c) => inRange(c.published))
  const month = (m) => model.recs.filter((r) => (r.date || '').startsWith(m)).reduce((s, r) => s + convert(r.amount, r.currency), 0)
    + model.only.filter((c) => (c.published || '').startsWith(m)).reduce((s, c) => s + convert(c.revenue, c.currency), 0)
  const values = lastMonths().map(month)
  const total = model.total, attr = model.attributed
  const clicks = sumBy(links, 'clicks')
  const conv = rev.filter((r) => r.conversionType === 'Purchase' || r.conversionType === 'Subscription').length + sumBy(content, 'conversions')
  const tops = [...content].sort((a, b) => convert(b.revenue, b.currency) - convert(a.revenue, a.currency)).slice(0, 4)
  const source = {}
  rev.forEach((r) => { const k = r.source || 'Other'; source[k] = (source[k] || 0) + convert(r.amount, r.currency) })
  if (model.contentTotal > 0) source['Content entries'] = (source['Content entries'] || 0) + model.contentTotal
  const max = Math.max(1, ...Object.values(source))
  const insights = insightRules(data, money, fmtNum, sumMoney).slice(0, 2)

  return (<>
    <Heading title="Overview" desc="Your business, connected. See what is recorded, what is attributed, and what deserves a closer look.">
      <select className="select-control" aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)}>
        <option value="all">All recorded time</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option>
      </select>
      <CreateButton type="revenue" />
    </Heading>
    {!allContent.length && !allRev.length && <Notice title="Your workspace is ready for your data.">Add content and revenue records to start seeing your business performance here.</Notice>}
    <div className="metric-grid">
      <Metric featured label="Recorded revenue" value={money(total)} foot={<span>{model.contentTotal > 0 ? `Includes ${money(model.contentTotal)} entered on content` : 'All saved revenue records'}</span>} tip="Sum of saved revenue records. Associated content does not add a second transaction." />
      <Metric label="Attributed revenue" value={money(attr)} foot={<span>{money(total - attr)} not attributed</span>} tip="Includes records marked Attributed or Manually associated." />
      <Metric label="Qualified clicks" value={fmtNum(clicks)} foot={<span>Recorded on tracking links</span>} />
      <Metric label="Conversions" value={fmtNum(conv)} foot={<span>Saved content and revenue events</span>} tip="Based on the conversion values recorded in your workspace." />
    </div>
    <div className="content-grid">
      <section className="panel" style={{ marginTop: 15 }}>
        <div className="panel-head"><div><h3>Revenue over time</h3><p>Monthly sums from saved revenue records</p></div><span className="tag">RECORDED DATA</span></div>
        <RevenueChart values={values} />
        <div className="legend"><span><i></i>Recorded revenue</span><span>Amounts converted to the display currency</span></div>
      </section>
      <section className="panel" style={{ marginTop: 15 }}>
        <div className="panel-head"><div><h3>Revenue by source</h3><p>Where recorded income is labelled</p></div><button className="text-button" onClick={() => go('revenue')}>View revenue ↗</button></div>
        {Object.keys(source).length ? (
          <div className="bar-list">
            {Object.entries(source).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => (
              <div key={k} className="bar-row"><span className="bar-label">{k}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${(v / max) * 100}%` }} /></div><span className="bar-value">{money(v)}</span></div>
            ))}
          </div>
        ) : <Empty title="No revenue sources yet" desc="Add a revenue record to see the breakdown."><CreateButton type="revenue" label="Add revenue" /></Empty>}
      </section>
    </div>
    <div className="section-title"><div><h2>Content associated with revenue</h2><p>Ranked by entered attributed revenue, not by views.</p></div><button className="text-button" onClick={() => go('content')}>Open content library ↗</button></div>
    <section className="panel table-panel">
      {tops.length ? (
        <div className="table-scroll"><table>
          <thead><tr><th>CONTENT</th><th>PLATFORM</th><th>VIEWS</th><th>CLICKS</th><th>ATTRIBUTED REVENUE</th></tr></thead>
          <tbody>{tops.map((c) => (
            <tr key={c.id}>
              <td><div className="content-cell"><span className="content-thumb">{(c.platform || 'C').slice(0, 1)}</span><span className="td-title">{c.title}<small className="td-sub">{c.published || 'No publish date'}</small></span></div></td>
              <td>{c.platform || '—'}</td><td>{fmtNum(c.views)}</td><td>{fmtNum(c.clicks)}</td><td className="money">{money(c.revenue, c.currency)}</td>
            </tr>))}</tbody>
        </table></div>
      ) : <Empty title="No content to rank" desc="Add content and associate revenue to understand which work earns."><CreateButton type="content" label="Add content" /></Empty>}
    </section>
    <div className="content-grid">
      <section>
        <div className="section-title"><div><h2>Evidence to investigate</h2><p>Rules based on the records in this workspace.</p></div><button className="text-button" onClick={() => go('insights')}>All insights ↗</button></div>
        {insights.length ? insights.map((x) => <InsightCard key={x.title} x={x} />) : <Empty title="Not enough evidence yet" desc="Add content, clicks, and revenue records. Insights will appear when the data supports a useful comparison." />}
      </section>
      <section>
        <div className="section-title"><div><h2>Recent activity</h2><p>Your latest workspace updates.</p></div></div>
        <div className="panel"><div className="activity-list">
          {data.activities.length ? data.activities.slice(0, 4).map((a) => (
            <div key={a.id} className="activity-item"><span className="activity-icon">↗</span><div><b>{a.text}</b><p>{a.detail || ''}</p></div><time>{new Date(a.date).toLocaleDateString()}</time></div>
          )) : <Empty title="Nothing here yet" desc="Your workspace activity will appear here." />}
        </div></div>
      </section>
    </div>
  </>)
}
