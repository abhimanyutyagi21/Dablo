import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DragCube from '../../components/DragCube'
import { useStore } from '../store'

const BARS = [34, 47, 41, 64, 58, 78, 70, 100]

export default function AuthGate() {
  const [params] = useSearchParams()
  const { signIn, signUp } = useStore()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'signin')
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const signup = mode === 'signup'
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    const email = f.email.trim().toLowerCase()
    if (!email) return setError('Enter your email address.')
    if (f.password.length < 8) return setError('Password must contain at least 8 characters.')
    if (signup) {
      if (!f.name.trim()) return setError('Enter your name.')
      if (f.password !== f.confirm) return setError('The passwords do not match.')
    }
    setBusy(true); setError('')
    const err = signup ? await signUp({ name: f.name.trim(), email, password: f.password }) : await signIn(email, f.password)
    setBusy(false)
    if (err) setError(err)
  }
  const toggle = () => { setMode(signup ? 'signin' : 'signup'); setF({ name: '', email: '', password: '', confirm: '' }); setError('') }

  return (
    <div id="authGate" className={'auth-gate' + (signup ? ' is-signup' : '')}>
      <section className="auth-layout" aria-label="Dablo account access">
        <div className="auth-card">
          <Link className="brand" to="/" aria-label="Dablo home">dablo<span>.</span></Link>
          <p className="eyebrow">YOUR CREATOR BUSINESS, CONNECTED</p>
          <h1>{signup ? 'Build your creator workspace.' : 'Welcome back.'}</h1>
          <p className="muted">{signup ? 'Create your account, then personalise your workspace.' : 'Sign in to continue to your workspace.'}</p>
          <form onSubmit={submit} noValidate>
            {signup && <label>Full name<input type="text" value={f.name} onChange={set('name')} autoComplete="name" placeholder="Your name" maxLength={80} /></label>}
            <label>Email address<input type="email" value={f.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" autoCapitalize="none" /></label>
            <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={signup ? 'new-password' : 'current-password'} placeholder="At least 8 characters" /></label>
            {signup && <label>Confirm password<input type="password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" placeholder="Re-enter your password" /></label>}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button primary full auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}{' '}<span aria-hidden="true">↗</span></button>
          </form>
          <button className="text-button" onClick={toggle}>{signup ? 'Already have an account? Sign in' : 'New to Dablo? Create an account'}</button>
        </div>
        <aside className="auth-showcase" aria-label="Dablo workspace overview">
          <div className="auth-showcase-top"><span className="auth-live"><i></i> CREATOR WORKSPACE</span><DragCube size={58} /></div>
          <div className="auth-showcase-copy">
            <p className="eyebrow">LESS GUESSWORK. MORE SIGNAL.</p>
            <h2>Make the money behind your content <em>make sense.</em></h2>
            <p>Bring content, clicks, campaigns and revenue into one clearer picture.</p>
          </div>
          <div className="auth-mini-dashboard">
            <div className="auth-mini-head"><span>YOUR BUSINESS / OVERVIEW</span><span>OVERVIEW</span></div>
            <div className="auth-mini-metrics">
              <div><small>RECORDED REVENUE</small><b>$2,400</b><span>Across your sources</span></div>
              <div><small>NET PROFIT</small><b>$1,800</b><span>Revenue − expenses</span></div>
            </div>
            <div className="auth-mini-chart" aria-hidden="true">{BARS.map((b, i) => <i key={i} style={{ '--bar': b + '%' }} />)}</div>
            <div className="auth-mini-foot"><span>CONTENT</span><span>→</span><span>CLICKS</span><span>→</span><span>REVENUE</span></div>
          </div>
        </aside>
      </section>
    </div>
  )
}
