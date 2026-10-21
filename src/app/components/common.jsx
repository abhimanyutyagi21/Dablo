import { createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Coin3D from '../../components/Coin3D'
import { tiltHandlers } from '../../hooks/motion'
import { num } from '../utils'
import { useStore } from '../store'

export const UICtx = createContext(null)
export const useUI = () => useContext(UICtx)
export const useGo = () => { const n = useNavigate(); return (page, qs = '') => { n(`/app/${page}${qs}`); } }

export const Heading = ({ title, desc, children }) => (
  <div className="page-heading">
    <div><span className="eyebrow">DABLO / {title.toUpperCase()}</span><h1>{title}</h1><p>{desc}</p></div>
    <div className="heading-actions">{children}</div>
  </div>
)

export const Empty = ({ title, desc, children }) => (
  <div className="empty-state"><Coin3D /><h3>{title}</h3><p>{desc}</p>{children}</div>
)

export function CreateButton({ type, label = 'Add record' }) {
  const { openForm } = useUI()
  return <button className="button primary" onClick={() => openForm(type)}>＋ {label}</button>
}

export const Metric = ({ label, value, foot = '', featured = false, tip = '' }) => (
  <article className={'metric-card' + (featured ? ' featured' : '')} {...tiltHandlers(5)}>
    <div className="metric-label">{label}{tip && <> <span className="info-dot" title={tip} aria-label={tip}>i</span></>}</div>
    <div className="metric-value">{value}</div>
    <div className="metric-foot">{foot}</div>
  </article>
)

export const Notice = ({ mark = '✦', title, children }) => (
  <div className="notice"><span className="notice-mark">{mark}</span><div><b>{title}</b><p>{children}</p></div></div>
)

export function RevenueChart({ values }) {
  const { money } = useStore()
  let pts = values.map(num)
  if (!pts.length || pts.every((v) => v === 0)) pts = [0, 0, 0, 0, 0, 0]
  const w = 600, h = 190, left = 38, right = 12, top = 10, bottom = 27
  const max = Math.max(1, ...pts) * 1.12, step = (w - left - right) / Math.max(1, pts.length - 1)
  const xy = pts.map((v, i) => [left + i * step, top + (h - top - bottom) * (1 - v / max)])
  const path = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const area = `${path} L ${xy[xy.length - 1][0]} ${h - bottom} L ${left} ${h - bottom} Z`
  const labels = ['6 mo ago', '5 mo', '4 mo', '3 mo', '2 mo', 'Last month']
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Recorded revenue over six monthly buckets">
        <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8bd95" stopOpacity=".38" /><stop offset="100%" stopColor="#a8bd95" stopOpacity=".02" />
        </linearGradient></defs>
        {[0, 0.33, 0.66, 1].map((t) => <line key={t} className="chart-grid" x1={left} x2={w - right} y1={top + (h - top - bottom) * t} y2={top + (h - top - bottom) * t} />)}
        <path className="chart-area" d={area} />
        <path className="chart-line" d={path} />
        {xy.map((p, i) => <circle key={i} className="chart-point" cx={p[0]} cy={p[1]} r="3.5"><title>{labels[i]}: {money(pts[i])}</title></circle>)}
        {labels.map((l, i) => <text key={l} className="chart-label" x={left + i * step} y={h - 5} textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}>{l}</text>)}
      </svg>
    </div>
  )
}

export const InsightCard = ({ x, full, children }) => (
  <article className="insight-card">
    <span className="insight-symbol">✳</span>
    <div>
      <h3>{x.title}</h3><p>{x.body}</p><span className="evidence">{x.evidence}</span>
      {full && <p style={{ marginTop: 8 }}><b>Suggested next step:</b> {x.next}</p>}
    </div>
    {children}
  </article>
)
