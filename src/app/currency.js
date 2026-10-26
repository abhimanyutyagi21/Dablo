// Exchange rates are "units per 1 USD" (from GET /api/rates). Convert by going through USD.
export function convertAmount(value, from, to, rates) {
  if (!from || !to || from === to) return value
  const r = rates?.rates
  if (!r || !(r[from] > 0) || !(r[to] > 0)) return value
  return (value / r[from]) * r[to]
}
