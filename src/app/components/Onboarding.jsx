import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CURRENCIES, PLATFORMS } from '../definitions'
import { useStore, useToast } from '../store'
import { useGo } from './common'

const TYPES = ['Solo creator', 'Creator team', 'Influencer', 'Writer / newsletter creator', 'Podcaster', 'Educator', 'Agency / manager', 'Other']
const GOALS = ['Understand total creator revenue', 'Find my highest-earning platforms', 'Compare content performance', 'Track affiliate and sponsorship income', 'Plan and measure campaigns', 'Grow a creator business']
const STREAMS = ['Platform payouts', 'Brand deals / sponsorships', 'Affiliate commissions', 'Digital products', 'Services / consulting', 'Memberships / subscriptions', 'Physical products', 'Not earning yet']
const AUDIENCE = ['Just starting', 'Under 1,000', '1,000–10,000', '10,000–100,000', '100,000–1 million', 'Over 1 million']

const Select = ({ label, value, onChange, options, blank, className = 'form-label' }) => (
  <label className={className}>{label}
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {blank !== undefined && <option value="">{blank}</option>}
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </label>
)

function Choices({ options, selected, onToggle, className = '' }) {
  return (
    <div className={'choice-grid ' + className}>
      {options.map((p) => {
        const on = selected.includes(p)
        return (
          <label key={p} className={'choice-card' + (on ? ' selected' : '')}>
            <input type="checkbox" checked={on} onChange={() => onToggle(p)} />
            <span className="choice-check">{on ? '✓' : '+'}</span><b>{p}</b>
          </label>
        )
      })}
    </div>
  )
}

// Three-step setup shown after sign-up. Platform choices don't connect any accounts.
export default function Onboarding() {
  const { settings, completeOnboarding } = useStore()
  const toast = useToast()
  const go = useGo()
  const [step, setStep] = useState(0)
  const [a, setA] = useState({
    name: settings.name || '', workspace: settings.workspace || '', creatorType: settings.creatorType || '', niche: settings.niche || '',
    platforms: settings.platforms || [], primaryGoal: settings.primaryGoal || '', audienceSize: settings.audienceSize || '',
    currency: settings.currency || 'INR', revenueStreams: settings.revenueStreams || [],
  })
  const set = (k) => (v) => setA((s) => ({ ...s, [k]: v }))
  const toggle = (k) => (v) => setA((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }))

  async function next() {
    const fail = (m) => { toast(m, true); return false }
    if (step === 0) {
      if (!a.name.trim() || !a.workspace.trim()) return fail('Add your name and workspace name to continue.')
      if (!a.creatorType) return fail('Choose what best describes you.')
    }
    if (step === 1) {
      if (!a.platforms.length) return fail('Choose at least one platform, or select Other if needed.')
      if (!a.primaryGoal) return fail('Choose your primary goal.')
    }
    if (step < 2) return setStep(step + 1)
    const err = await completeOnboarding({ ...a, name: a.name.trim(), workspace: a.workspace.trim(), niche: a.niche.trim() })
    if (err) toast(err, true)
    else go('overview')
  }

  return (
    <div className="onboarding-gate">
      <section className="onboarding-card">
        <div className="onboarding-head"><Link className="brand" to="/">dablo<span>.</span></Link><span className="onboarding-step">SETUP / {step + 1} OF 3</span></div>
        <div className="onboarding-progress"><i style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
        <div>
          {step === 0 && <>
            <p className="eyebrow">LET'S SET UP YOUR SPACE</p><h1>First, tell us about you.</h1>
            <p className="onboarding-intro">We'll use this to shape your workspace. No platform connection is required.</p>
            <div className="form-grid">
              <label className="form-label">Your display name<input maxLength={80} value={a.name} onChange={(e) => set('name')(e.target.value)} placeholder="e.g. Alex Creator" /></label>
              <label className="form-label">Workspace name<input maxLength={80} value={a.workspace} onChange={(e) => set('workspace')(e.target.value)} placeholder="e.g. Alex Studio" /></label>
              <Select label="What best describes you?" value={a.creatorType} onChange={set('creatorType')} options={TYPES} blank="Choose one" />
              <label className="form-label">Main niche<input value={a.niche} onChange={(e) => set('niche')(e.target.value)} placeholder="e.g. technology, fitness, lifestyle" /></label>
            </div></>}
          {step === 1 && <>
            <p className="eyebrow">YOUR CONTENT CHANNELS</p><h1>Where do you publish?</h1>
            <p className="onboarding-intro">Choose every platform you use. These become separate views inside your dashboard.</p>
            <Choices options={PLATFORMS} selected={a.platforms} onToggle={toggle('platforms')} />
            <Select className="form-label onboarding-select" label="What do you mainly want to track?" value={a.primaryGoal} onChange={set('primaryGoal')} options={GOALS} blank="Choose a primary goal" /></>}
          {step === 2 && <>
            <p className="eyebrow">YOUR BUSINESS MODEL</p><h1>What does earning look like for you?</h1>
            <p className="onboarding-intro">This helps set up relevant categories. You can select multiple revenue streams.</p>
            <Choices className="revenue-choice-grid" options={STREAMS} selected={a.revenueStreams} onToggle={toggle('revenueStreams')} />
            <div className="form-grid onboarding-bottom-grid">
              <Select label="Current audience size" value={a.audienceSize} onChange={set('audienceSize')} options={AUDIENCE} blank="Prefer not to say" />
              <Select label="Primary currency" value={a.currency} onChange={set('currency')} options={CURRENCIES} />
            </div></>}
        </div>
        <div className="onboarding-actions">
          {step > 0 && <button className="button ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          <span className="onboarding-spacer"></span>
          <button className="button primary" onClick={next}>{step === 2 ? 'Finish setup ↗' : 'Continue ↗'}</button>
        </div>
        <p className="onboarding-footnote">You can change these preferences later in Settings. Platform selection does not connect external accounts.</p>
      </section>
    </div>
  )
}
