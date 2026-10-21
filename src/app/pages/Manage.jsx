import { useState } from 'react'
import { CURRENCIES, definitions } from '../definitions'
import { Heading } from '../components/common'
import { useStore, useToast } from '../store'
import { download, today } from '../utils'
import { useExportCSV } from './CollectionPage'

export function Reports() {
  const { data } = useStore()
  const exportCSV = useExportCSV()
  return (<>
    <Heading title="Reports" desc="Export the records behind your decisions. Export your workspace records for analysis or backup." />
    <div className="report-grid">{Object.keys(definitions).map((t) => (
      <article key={t} className="report-card">
        <div className="card-topline"><span className="card-symbol">{definitions[t].icon}</span><span className="tag">{data.collections[t].length} RECORDS</span></div>
        <h3>{definitions[t].label} report</h3><p>Export your {definitions[t].label.toLowerCase()} fields as a CSV file for analysis or backup.</p>
        <button className="button ghost" onClick={() => exportCSV(t)}>↓ Export CSV</button>
      </article>))}</div>
    <div className="section-title"><div><h2>Data integrity</h2><p>Keep a clear distinction between observed events and assumptions.</p></div></div>
    <div className="panel">
      {[['Currency consistency', 'Use consistent currencies when comparing totals.', 'Review before comparing', true],
        ['Attribution', 'Revenue attribution labels are user-entered and not independently verified.', 'Manual evidence'],
        ['Data storage', 'Workspace records and preferences.', 'Workspace']].map(([t, d, pill, warn]) => (
        <div key={t} className="settings-row"><div><b>{t}</b><small>{d}</small></div><span className={'status-pill' + (warn ? ' warn' : '')}>{pill}</span></div>))}
    </div>
  </>)
}

const TABS = [['profile', 'Profile'], ['workspace', 'Workspace'], ['data', 'Data & privacy'], ['account', 'Account']]

export function Settings() {
  const { data, settings, updateSettings, wipe, signOut } = useStore()
  const toast = useToast()
  const [tab, setTab] = useState('profile')

  const save = async (e) => {
    e.preventDefault()
    const patch = {}
    for (const [k, v] of new FormData(e.currentTarget).entries()) patch[k] = String(v).trim()
    const err = await updateSettings(patch)
    err ? toast(err, true) : toast('Settings saved.')
  }
  const backup = () => { download(JSON.stringify(data, null, 2), `dablo-workspace-backup-${today()}.json`, 'application/json'); toast('Workspace backup downloaded.') }

  return (<>
    <Heading title="Settings" desc="Manage your profile, workspace preferences and data export." />
    <div className="settings-layout">
      <nav className="settings-nav">{TABS.map(([k, v]) => <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{v}</button>)}</nav>
      <section className="panel settings-panel">
        {tab === 'profile' && <><h3>Your profile</h3><p>Manage the details associated with your profile.</p>
          <form className="form-grid" onSubmit={save}>
            <label className="form-label">Display name<input name="name" required defaultValue={settings.name || ''} /></label>
            <label className="form-label">Email<input name="email" type="email" required defaultValue={settings.email || ''} /></label>
            <label className="form-label">Preferred currency<select name="currency" defaultValue={settings.currency}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <div className="wide" style={{ textAlign: 'right' }}><button className="button primary">Save preferences ↗</button></div>
          </form></>}
        {tab === 'workspace' && <><h3>Workspace</h3><p>Choose a name for your workspace.</p>
          <form className="form-grid" onSubmit={save}>
            <label className="form-label wide">Workspace name<input name="workspace" required defaultValue={settings.workspace || ''} /></label>
            <div className="wide" style={{ textAlign: 'right' }}><button className="button primary">Save workspace ↗</button></div>
          </form></>}
        {tab === 'data' && <><h3>Data & privacy</h3><p>Manage your workspace data and exports.</p>
          <div className="settings-row"><div><b>Export complete workspace</b><small>Download your records and settings as JSON.</small></div><button className="button ghost" onClick={backup}>↓ Download backup</button></div>
          <div className="settings-row"><div><b>Clear all workspace records</b><small>Remove content, revenue and other workspace records.</small></div><button className="button ghost" onClick={wipe}>Clear records</button></div>
          <div className="settings-row"><div><b>Delete all workspace data</b><small>Remove records and preferences from your workspace.</small></div><button className="button ghost" onClick={wipe}>Delete data</button></div></>}
        {tab === 'account' && <><h3>Account & security</h3><p>Manage your account session and workspace access.</p><button className="button ghost" onClick={signOut}>Sign out</button></>}
      </section>
    </div>
  </>)
}
