import { CreateButton, Empty, Heading, InsightCard, Notice, useGo } from '../components/common'
import { insightRules } from '../selectors'
import { useStore, useToast } from '../store'
import AiSummary from './AiSummary'

const TARGET = { Revenue: 'revenue', 'Tracking links': 'links' }
const RULES = [
  ['↗', 'REVENUE', 'Top entered revenue', 'Ranks content by the revenue value entered on the content record. Verify associations against revenue records.'],
  ['⌁', 'TRACKING', 'Clicks without conversions', 'Highlights a possible tracking gap or a traffic-to-conversion issue. It does not prove a broken funnel.'],
  ['◇', 'ATTRIBUTION', 'Unattributed revenue', 'Surfaces records that may need evidence before a content or campaign association can be made.'],
]

export default function Insights() {
  const { data, money, fmtNum, saveInsight } = useStore()
  const go = useGo()
  const toast = useToast()
  const xs = insightRules(data, money, fmtNum)
  return (<>
    <Heading title="Insights" desc="Evidence first. These rules explain what the saved records can support."><button className="button ghost" onClick={() => go('content')}>Review content</button></Heading>
    <Notice mark="✳" title="Insights are not causal proof.">These deterministic checks use fields saved in this workspace. They are signals to investigate, not claims that content caused a sale. Small samples can be misleading.</Notice>
    <AiSummary />
    {xs.length ? xs.map((x) => (
      <InsightCard key={x.title} x={x} full>
        <div className="insight-actions">
          <button className="button ghost" onClick={() => go(TARGET[x.record] || 'content')}>Inspect ↗</button>
          <button className="button primary" onClick={async () => { const err = await saveInsight(x); err ? toast(err, true) : go('frameworks') }}>Save as framework</button>
        </div>
      </InsightCard>
    )) : <Empty title="No actionable signals yet" desc="Add content and revenue data. Dablo will only show insights when your records support a useful observation."><CreateButton type="content" label="Add content" /></Empty>}
    <div className="section-title"><div><h2>What the rules check</h2><p>Signals are recalculated whenever you save a record.</p></div></div>
    <div className="framework-grid">{RULES.map(([sym, tag, t, d]) => (
      <article key={t} className="framework-card"><div className="card-topline"><span className="card-symbol">{sym}</span><span className="tag">{tag}</span></div><h3>{t}</h3><p>{d}</p></article>
    ))}</div>
  </>)
}
