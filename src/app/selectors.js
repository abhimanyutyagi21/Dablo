import { isAttributed, num, sumBy } from './utils'

// Rule-based "evidence to investigate" signals. Deterministic — never causal claims.
export function insightRules(data, money, fmtNum, sumMoney = (list, key) => sumBy(list, key)) {
  const out = []
  const { content: cs, links, revenue: rev } = data.collections
  if (cs.length) {
    const val = (c) => sumMoney([c], 'revenue')
    const sorted = [...cs].sort((a, b) => val(b) - val(a))
    if (sorted.length >= 2 && val(sorted[0]) > val(sorted[1])) {
      out.push({ title: `“${sorted[0].title}” has the highest entered revenue`, record: 'Content', next: 'Compare the content details',
        body: `It is recorded at ${money(sorted[0].revenue, sorted[0].currency)} across ${fmtNum(sorted[0].views)} views. Compare its offer, hook, format and call to action with other content before drawing conclusions.`,
        evidence: `${cs.length} content records · entered revenue fields` })
    }
    const noConv = cs.filter((c) => num(c.clicks) > 0 && num(c.conversions) === 0)
    if (noConv.length) out.push({ title: `${noConv.length} content item(s) have clicks but no recorded conversions`, record: 'Content', next: 'Review tracking setup',
      body: 'This can mean the traffic did not convert, conversion tracking is missing, or the observation window is too short. Check the destination and event setup.',
      evidence: `${noConv.length} content records with clicks and zero entered conversions` })
  }
  const un = rev.filter((r) => r.attribution === 'Unattributed')
  if (un.length) out.push({ title: `${money(sumMoney(un, 'amount'))} is marked unattributed`, record: 'Revenue', next: 'Review revenue records',
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

// Revenue typed on a content item counts toward totals only when no saved revenue record is linked to that
// content (matched by title), so the same money is never counted twice.
export function contentOnlyRevenue(collections) {
  const linked = new Set(collections.revenue.map((r) => String(r.content || '').trim().toLowerCase()).filter(Boolean))
  return collections.content.filter((c) => num(c.revenue) > 0 && !linked.has(String(c.title || '').trim().toLowerCase()))
}

// All revenue totals in the display currency. `conv(value, fromCurrency)` comes from the store.
export function revenueModel(collections, conv, inRange = () => true) {
  const recs = collections.revenue.filter((r) => inRange(r.date))
  const only = contentOnlyRevenue(collections).filter((c) => inRange(c.published))
  const sum = (list, key) => list.reduce((t, r) => t + conv(r[key], r.currency), 0)
  const recordTotal = sum(recs, 'amount'), contentTotal = sum(only, 'revenue')
  return {
    recs, only, recordTotal, contentTotal, total: recordTotal + contentTotal,
    attributed: sum(recs.filter(isAttributed), 'amount') + contentTotal,
    unattributed: sum(recs.filter((r) => r.attribution === 'Unattributed'), 'amount'),
  }
}
