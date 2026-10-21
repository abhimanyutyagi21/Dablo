import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PAGE_TITLES } from './definitions'
import { useStore } from './store'
import { UICtx, useGo } from './components/common'
import RecordModal from './components/RecordModal'
import SearchModal from './components/SearchModal'
import Overview from './pages/Overview'
import CollectionPage from './pages/CollectionPage'
import { Frameworks, Products } from './pages/Cards'
import Insights from './pages/Insights'
import Platforms from './pages/Platforms'
import { Reports, Settings } from './pages/Manage'
import QuickStart from './pages/QuickStart'

const MAIN = [['overview', '◫', 'Overview'], ['content', '▤', 'Content'], ['revenue', '↗', 'Revenue'], ['links', '⌁', 'Tracking links'],
  ['campaigns', '◉', 'Campaigns'], ['insights', '✳', 'Insights'], ['frameworks', '▧', 'Frameworks'], ['products', '◇', 'Products & offers']]
const MANAGE = [['reports', '▥', 'Reports'], ['platforms', '◉', 'Platforms & earnings'], ['settings', '⚙', 'Settings']]

function PageView({ page }) {
  switch (page) {
    case 'content': case 'links': case 'campaigns': return <CollectionPage type={page} />
    case 'revenue': return <CollectionPage type="revenue" />
    case 'products': return <Products />
    case 'frameworks': return <Frameworks />
    case 'insights': return <Insights />
    case 'reports': return <Reports />
    case 'platforms': return <Platforms />
    case 'settings': return <Settings />
    default: return <Overview />
  }
}

export default function AppShell({ page }) {
  const { settings, saved } = useStore()
  const go = useGo()
  const [modal, setModal] = useState(null)
  const [searching, setSearching] = useState(false)
  const [menu, setMenu] = useState(false)
  const [quick, setQuick] = useState(false)

  useEffect(() => { setMenu(false); setQuick(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])
  const ui = useMemo(() => ({ openForm: (type, record = null) => setModal({ type, record }), openSearch: () => setSearching(true) }), [])

  const name = settings.name || 'Creator'
  const initial = name.slice(0, 1).toUpperCase()
  const Item = ([key, icon, label]) => (
    <button key={key} className={'nav-item' + (page === key ? ' active' : '')} onClick={() => go(key)}>
      <span>{icon}</span>{label}{key === 'insights' && <> <i className="nav-dot"></i></>}
    </button>
  )

  return (
    <UICtx.Provider value={ui}>
      <div className="app-frame">
        <aside className={'sidebar' + (menu ? ' open' : '')}>
          <Link className="brand" to="/" aria-label="Dablo public website">dablo<span>.</span></Link>
          <button className="workspace-switch">
            <span className="workspace-mark">S</span>
            <span><b>{settings.workspace || 'My workspace'}</b><small>Personal workspace</small></span>
            <span className="chevron">⌄</span>
          </button>
          <div className="nav-label">WORKSPACE</div>
          <nav className="primary-nav" aria-label="Main navigation">{MAIN.map(Item)}</nav>
          <div className="nav-label secondary-label">MANAGE</div>
          <nav className="primary-nav" aria-label="Management navigation">{MANAGE.map(Item)}</nav>
          <div className="sidebar-bottom">
            <div className="help-card"><span className="help-icon">✦</span><b>Start with the signal</b><p>Link a piece of content to a commercial outcome.</p>
              <button onClick={() => setQuick(true)}>Quick start ↗</button></div>
            <div className="profile">
              <span className="avatar">{initial}</span>
              <span className="profile-copy"><b>{name}</b><small>{settings.email || 'Workspace account'}</small></span>
              <button className="icon-button" aria-label="Open settings" onClick={() => go('settings')}>···</button>
            </div>
          </div>
        </aside>
        <main className="main-area">
          <header className="topbar">
            <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMenu((m) => !m)}>☰</button>
            <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><b>{PAGE_TITLES[page] || 'Overview'}</b></div>
            <div className="top-actions">
              <span className="data-status"><i></i><span>{saved ? 'Changes saved' : 'Workspace ready'}</span></span>
              <button className="icon-button search-open" aria-label="Search workspace" onClick={() => setSearching(true)}>⌕</button>
              <button className="button primary compact" onClick={() => ui.openForm('content')}>＋ Create new</button>
              <button className="avatar small-avatar" aria-label="Open settings" onClick={() => go('settings')}>{initial}</button>
            </div>
          </header>
          <section className="page-wrap reveal" key={page} id="pageRoot" tabIndex={-1}>
            {quick && <QuickStart />}
            <PageView page={page} />
          </section>
          <footer className="app-footer"><span>© Dablo · Make the money behind your content make sense.</span><span>Creator revenue workspace</span></footer>
        </main>
      </div>
      <RecordModal modal={modal} onClose={() => setModal(null)} />
      <SearchModal open={searching} onClose={() => setSearching(false)} />
    </UICtx.Provider>
  )
}
