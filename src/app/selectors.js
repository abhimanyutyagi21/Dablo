import { isAttributed, num, sumBy } from './utils'

// Rule-based "evidence to investigate" signals. Deterministic — never causal claims.
export function insightRules(data, money, fmtNum) {
  const out = []
  const { content: cs, links, revenue: rev } = data.collections
  if (cs.length) {
    const sorted = [...cs].sort((a, b) => num(b.revenue) - num(a.revenue))
    if (sorted.length >= 2 && num(sorted[0].revenue) > num(sorted[1].revenue)) {
      out.push({ title: `“${sorted[0].title}” has the highest entered revenue`, record: 'Content', next: 'Compare the content details',
        body: `It is recorded at ${money(sorted[0].revenue)} across ${fmtNum(sorted[0].views)} views. Compare its offer, hook, format and call to action with other content before drawing conclusions.`,
        evidence: `${cs.length} content records · entered revenue fields` })
    }
    const noConv = cs.filter((c) => num(c.clicks) > 0 && num(c.conversions) === 0)
    if (noConv.length) out.push({ title: `${noConv.length} content item(s) have clicks but no recorded conversions`, record: 'Content', next: 'Review tracking setup',
      body: 'This can mean the traffic did not convert, conversion tracking is missing, or the observation window is too short. Check the destination and event setup.',
      evidence: `${noConv.length} content records with clicks and zero entered conversions` })
  }
  const un = rev.filter((r) => r.attribution === 'Unattributed')
  if (un.length) out.push({ title: `${money(sumBy(un, 'amount'))} is marked unattributed`, record: 'Revenue', next: 'Review revenue records',
    body: 'These revenue records have no attributed status. Review transaction references and supporting evidence before assigning content credit.',
    evidence: `${un.length} revenue record(s) marked Unattributed` })
  if (links.some((l) => l.status === 'Active' && num(l.clicks) > 0 && num(l.conversions) === 0)) out.push({
    title: 'Active tracking links have clicks but no recorded conversions', record: 'Tracking links', next: 'Inspect tracking links',
    body: 'A click is not a sale. Verify destination URLs, conversion events and whether enough time has passed for an outcome to be recorded.',
    evidence: 'Active links with clicks and zero entered conversions' })
  return out
}

export const platformRevenueRecords = (data, platform) => data.collections.revenue.filter((r) => {
  if (r.platform && r.platform !== 'Unassigned') return r.platform === platform
  return data.collections.content.find((c) => c.title === r.content)?.platform === platform
})

export { isAttributed }
