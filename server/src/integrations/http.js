// JSON GET with a bearer token, a timeout, and readable errors (status attached).
export async function getJson(url, { token, headers = {} } = {}) {
  let res
  try {
    res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, ...headers }, signal: AbortSignal.timeout(20000) })
  } catch { throw Object.assign(new Error('Could not reach the platform. Try again shortly.'), { status: 0 }) }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error?.message || data.message || `Platform request failed (${res.status}).`), { status: res.status })
  return data
}
