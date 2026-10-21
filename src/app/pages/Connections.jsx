import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useStore, useToast } from '../store'

const FEED_TYPES = ['Blog', 'Newsletter', 'Podcast', 'Other']
const when = (iso) => (iso ? new Date(iso).toLocaleString() : 'never')

function ProviderCard({ p, busy, onConnect, onSync, onDisconnect }) {
  const c = p.connection
  const broken = c?.status === 'needs_reconnect'
  return (
    <article className="platform-card">
      <div className="platform-card-top">
        <span className="platform-mark">{p.label.slice(0, 1)}</span>
        <span className={'status-pill' + (c && !broken ? '' : ' warn')}>{broken ? 'Reconnect needed' : c ? 'Connected' : p.configured ? 'Not connected' : 'Setup needed'}</span>
      </div>
      <h3>{p.label}</h3>
      <small className="platform-muted">
        {c ? `Connected as ${c.accountName}` : p.configured ? 'Import your videos and stats automatically.' : p.setupHint}
      </small>
      {c && <p style={{ fontSize: 11, color: 'var(--muted)', margin: '10px 0 0' }}>Last sync: {when(c.lastSyncAt)}<br />{c.note}</p>}
      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
        {!c || broken ? (
          <button className="button primary" disabled={!p.configured || busy} onClick={() => onConnect(p.id)}>{broken ? 'Reconnect' : `Connect ${p.label}`} ↗</button>
        ) : (
          <button className="button primary" disabled={busy} onClick={() => onSync(p.id)}>{busy === `sync-${p.id}` ? 'Syncing…' : 'Sync now'}</button>
        )}
        {c && <button className="button ghost" disabled={!!busy} onClick={() => onDisconnect(p)}>Disconnect</button>}
      </div>
    </article>
  )
}

// Platform connections (YouTube, Twitch) and RSS feeds (blogs, newsletters, podcasts).
export default function Connections() {
  const { reload } = useStore()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState('')
  const [feed, setFeed] = useState({ url: '', platform: 'Blog' })

  const load = useCallback(async () => {
    try { setInfo(await api.get('/integrations')) } catch (e) { toast(e.message, true) }
  }, [toast])
  useEffect(() => { load() }, [load])

  // The OAuth callback sends the browser back here with ?connected=… or ?error=…
  useEffect(() => {
    const ok = params.get('connected'), err = params.get('error')
    if (!ok && !err) return
    err ? toast(err, true) : toast(`${ok[0].toUpperCase() + ok.slice(1)} connected. Your data is being imported.`)
    const next = new URLSearchParams(params); next.delete('connected'); next.delete('error')
    setParams(next, { replace: true }); load(); reload()
  }, []) // eslint-disable-line

  const run = async (key, fn, message) => {
    setBusy(key)
    try { const r = await fn(); if (message) toast(message(r)); await Promise.all([load(), reload()]) }
    catch (e) { toast(e.message, true); load() }
    setBusy('')
  }
  const connect = async (id) => {
    setBusy(id)
    try { window.location.href = (await api.get(`/integrations/${id}/connect`)).url } catch (e) { toast(e.message, true); setBusy('') }
  }
  const disconnect = (p) => confirm(`Disconnect ${p.label}? Records already imported are kept.`) &&
    run(`off-${p.id}`, () => api.del(`/integrations/${p.id}`), () => `${p.label} disconnected.`)
  const addFeed = (e) => {
    e.preventDefault()
    run('feed', () => api.post('/integrations/feeds', feed), (r) => `Feed added: ${r.note}`).then(() => setFeed((f) => ({ ...f, url: '' })))
  }

  if (!info) return null
  return (<>
    <div className="section-title"><div><h2>Connections</h2><p>Import real data instead of typing it. Tokens stay on the server, encrypted.</p></div></div>
    <div className="platform-grid">
      {info.providers.map((p) => (
        <ProviderCard key={p.id} p={p} busy={busy}
          onConnect={connect} onSync={(id) => run(`sync-${id}`, () => api.post(`/integrations/${id}/sync`), (r) => `Synced. ${r.note}`)} onDisconnect={disconnect} />
      ))}
    </div>
    <section className="panel" style={{ marginTop: 15 }}>
      <div className="panel-head"><div><h3>Blog, newsletter & podcast feeds</h3><p>Paste an RSS or Atom feed URL. Works with Substack, beehiiv, Ghost, WordPress and podcast hosts.</p></div><span className="tag">NO LOGIN NEEDED</span></div>
      <form className="form-grid" onSubmit={addFeed}>
        <label className="form-label wide">Feed URL<input type="url" required value={feed.url} onChange={(e) => setFeed({ ...feed, url: e.target.value })} placeholder="https://yourname.substack.com/feed" /></label>
        <label className="form-label">Type<select value={feed.platform} onChange={(e) => setFeed({ ...feed, platform: e.target.value })}>{FEED_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <div className="form-label" style={{ alignSelf: 'end' }}><button className="button primary" disabled={busy === 'feed'}>{busy === 'feed' ? 'Importing…' : 'Add feed ↗'}</button></div>
      </form>
      {info.feeds.map((f) => (
        <div key={f.id} className="settings-row">
          <div><b>{f.title || f.url}</b><small>{f.platform} · {f.url}<br />Last sync: {when(f.lastSyncAt)} · {f.note}</small></div>
          <div className="table-actions">
            <button className="tiny-action" onClick={() => run(`f-${f.id}`, () => api.post(`/integrations/feeds/${f.id}/sync`), (r) => `Synced. ${r.note}`)}>Sync</button>
            <button className="tiny-action" onClick={() => confirm('Remove this feed? Imported posts are kept.') && run(`d-${f.id}`, () => api.del(`/integrations/feeds/${f.id}`), () => 'Feed removed.')}>Remove</button>
          </div>
        </div>
      ))}
    </section>
  </>)
}
