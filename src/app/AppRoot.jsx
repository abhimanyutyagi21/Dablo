import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import css from '../styles/app.css?inline'
import extras from '../styles/extras.css?inline'
import useScopedStyles from '../hooks/useScopedStyles'
import { StoreProvider, ToastProvider, useStore } from './store'
import AuthGate from './components/AuthGate'
import Onboarding from './components/Onboarding'
import AppShell from './AppShell'

function Gate() {
  const { session, settings, booting, bootError, retry } = useStore()
  const { page } = useParams()
  if (booting) return null
  if (bootError) return (
    <div className="auth-gate"><section className="auth-layout"><div className="auth-card">
      <p className="eyebrow">CONNECTION PROBLEM</p><h1>Can't reach Dablo.</h1><p className="muted">{bootError}</p>
      <button className="button primary" onClick={retry}>Try again</button>
    </div></section></div>
  )
  if (!session) return <AuthGate />
  if (!page) return <Navigate to="/app/overview" replace />
  return (<>
    <AppShell page={page} />
    {!settings.onboardingComplete && <Onboarding />}
  </>)
}

export default function AppRoot() {
  useScopedStyles(css + extras, 'app')
  useEffect(() => { document.title = 'Dablo App — Revenue intelligence' }, [])
  return (
    <ToastProvider>
      <StoreProvider><Gate /></StoreProvider>
    </ToastProvider>
  )
}
