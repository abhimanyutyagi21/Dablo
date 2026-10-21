import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { definitions } from './definitions'
import { fmtMoney, fmtNum, uid } from './utils'

// ── Toasts ────────────────────────────────────────────────────────────────
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const toast = useCallback((msg, error = false) => {
    const id = uid('t')
    setItems((l) => [...l, { id, msg, error }])
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-region" aria-live="polite">
        {items.map((t) => <div key={t.id} className={'toast' + (t.error ? ' error' : '')}>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  )
}

// ── Workspace store (backed by the API) ───────────────────────────────────
const blank = () => ({
  collections: Object.fromEntries(Object.keys(definitions).map((k) => [k, []])),
  activities: [],
  settings: { name: '', workspace: 'My workspace', currency: 'INR', email: '', onboardingComplete: false },
})

const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)

export function StoreProvider({ children }) {
  const toast = useToast()
  const [data, setData] = useState(blank)
  const [session, setSession] = useState(null)   // { id, email } when signed in
  const [booting, setBooting] = useState(true)
  const [bootError, setBootError] = useState('')
  const [saved, setSaved] = useState(false)

  // Apply a full workspace payload from /workspace, /auth/login, /auth/signup or DELETE /workspace.
  const hydrate = (w) => {
    setSession(w.user)
    setData({ collections: w.collections, activities: w.activities, settings: w.settings })
  }

  const boot = useCallback(async () => {
    setBooting(true); setBootError('')
    try { hydrate(await api.get('/workspace')) }
    catch (e) { if (e.status === 401) setSession(null); else setBootError(e.message) }
    setBooting(false)
  }, [])
  useEffect(() => { boot() }, [boot])

  useEffect(() => {
    if (!session) return
    let last = Date.now()
    const resync = async () => {
      if (document.visibilityState !== 'visible' || Date.now() - last < 15000) return
      last = Date.now()
      try { hydrate(await api.get('/workspace')) } catch (e) { if (e.status === 401) setSession(null) }
    }
    document.addEventListener('visibilitychange', resync)
    window.addEventListener('focus', resync)
    return () => { document.removeEventListener('visibilitychange', resync); window.removeEventListener('focus', resync) }
  }, [session?.id]) // eslint-disable-line

  const { settings } = data
  const money = useCallback((v, c) => fmtMoney(v, c || settings.currency || 'USD'), [settings.currency])
  const patchCollection = (type, fn, activities) =>
    setData((d) => ({ ...d, activities, collections: { ...d.collections, [type]: fn(d.collections[type]) } }))
  const attempt = async (fn) => { try { await fn(); setSaved(true); return null } catch (e) { return e.message } }

  const actions = {
    // All actions resolve to an error string, or null on success.
    saveRecord: (type, obj, editId) => attempt(async () => {
      const res = editId ? await api.patch(`/records/${type}/${editId}`, obj) : await api.post(`/records/${type}`, obj)
      patchCollection(type, (list) => (editId ? list.map((x) => (x.id === editId ? res.record : x)) : [res.record, ...list]), res.activities)
      toast(`${definitions[type].label} ${editId ? 'updated' : 'saved'}.`)
    }),
    deleteRecord: async (type, id) => {
      if (!confirm(`Delete this ${definitions[type].singular}? This cannot be undone.`)) return
      const err = await attempt(async () => {
        const res = await api.del(`/records/${type}/${id}`)
        patchCollection(type, (list) => list.filter((x) => x.id !== id), res.activities)
        toast('Record deleted.')
      })
      if (err) toast(err, true)
    },
    updateSettings: (patch) => attempt(async () => {
      const res = await api.patch('/settings', patch)
      setData((d) => ({ ...d, settings: res.settings, activities: res.activities }))
      setSession((s) => ({ ...s, email: res.settings.email }))
    }),
    completeOnboarding: (answers) => attempt(async () => {
      const res = await api.patch('/settings', { ...answers, onboardingComplete: true })
      setData((d) => ({ ...d, settings: res.settings, activities: res.activities }))
      toast('Workspace setup complete.')
    }),
    saveInsight: (x) => attempt(async () => {
      const fw = { name: x.title, topic: 'Evidence-based observation', hook: '', cta: '', evidence: x.evidence, status: 'Testing',
        structure: `Observation: ${x.body}\nEvidence: ${x.evidence}\nNext step: ${x.next}`,
        notes: 'Saved from Dablo insights. This is an observation to test, not causal proof.' }
      const res = await api.post('/records/frameworks', fw)
      patchCollection('frameworks', (list) => [res.record, ...list], res.activities)
      toast('Insight saved as a testing framework.')
    }),
    wipe: async () => {
      if (!confirm('Permanently clear all workspace records?')) return
      const err = await attempt(async () => { hydrate(await api.del('/workspace')); toast('Workspace data cleared.') })
      if (err) toast(err, true)
    },
    reload: () => attempt(async () => hydrate(await api.get('/workspace'))),
    signUp: ({ name, email, password }) => attempt(async () => hydrate(await api.post('/auth/signup', { name, email, password }))),
    signIn: (email, password) => attempt(async () => {
      const w = await api.post('/auth/login', { email, password })
      hydrate(w)
      if (w.settings.onboardingComplete) toast('Welcome back.')
    }),
    signOut: async () => {
      await api.post('/auth/logout').catch(() => {})
      setSession(null); setData(blank()); setSaved(false)
    },
  }

  const value = useMemo(() => ({ data, settings, session, booting, bootError, retry: boot, saved, money, fmtNum, ...actions }), [data, session, booting, bootError, saved, money]) // eslint-disable-line
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
