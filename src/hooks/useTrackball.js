import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from './motion'

// Free 3D trackball rotation with momentum. Rotation lives in a CSS variable (--rot)
// so dragging never triggers React re-renders.
const K = 0.014
const FRICTION = 0.94
const mul = (a, b) => {
  const r = new Array(9)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]
  return r
}
const rotX = (a) => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c] }
const rotY = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c] }
const css = (m) => 'matrix3d(' + [m[0], m[3], m[6], 0, m[1], m[4], m[7], 0, m[2], m[5], m[8], 0, 0, 0, 0, 1].map((v) => v.toFixed(5)).join(',') + ')'

export default function useTrackball({ x = 0.2, y = -0.32, idle = 0 } = {}) {
  const ref = useRef(null)
  const [dragging, setDragging] = useState(false)
  const s = useRef({ m: mul(rotX(x), rotY(y)), vx: 0, vy: 0, raf: 0, id: null, lx: 0, ly: 0, lt: 0, moved: false, travel: 0, dragged: false })

  const apply = () => ref.current && ref.current.style.setProperty('--rot', css(s.current.m))
  const spin = (dx, dy) => { s.current.m = mul(rotX(-dy), mul(rotY(dx), s.current.m)); apply() }

  useEffect(() => {
    apply()
    const st = s.current
    let raf
    const loop = () => {
      if (idle && st.id === null && Math.hypot(st.vx, st.vy) < 0.0005) spin(idle, idle * 0.4)
      raf = requestAnimationFrame(loop)
    }
    if (idle && !reducedMotion()) raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(st.raf) }
  }, [idle])

  const coast = () => {
    const st = s.current
    if (reducedMotion()) return
    cancelAnimationFrame(st.raf)
    const tick = () => {
      st.vx *= FRICTION; st.vy *= FRICTION
      if (Math.hypot(st.vx, st.vy) < 0.0005) return
      spin(st.vx, st.vy)
      st.raf = requestAnimationFrame(tick)
    }
    st.raf = requestAnimationFrame(tick)
  }

  const end = (e) => {
    const st = s.current
    if (st.id !== e.pointerId) return
    st.id = null
    setDragging(false)
    if (st.moved) {
      st.dragged = true
      setTimeout(() => { st.dragged = false }, 60)
      if (performance.now() - st.lt > 80) st.vx = st.vy = 0
      coast()
    }
  }

  const bind = {
    onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const st = s.current
      cancelAnimationFrame(st.raf)
      Object.assign(st, { id: e.pointerId, lx: e.clientX, ly: e.clientY, lt: performance.now(), moved: false, travel: 0, vx: 0, vy: 0 })
      e.currentTarget.setPointerCapture(e.pointerId)
      setDragging(true)
      e.preventDefault()
    },
    onPointerMove(e) {
      const st = s.current
      if (st.id !== e.pointerId) return
      const dx = e.clientX - st.lx, dy = e.clientY - st.ly
      st.lx = e.clientX; st.ly = e.clientY; st.lt = performance.now()
      st.travel += Math.abs(dx) + Math.abs(dy)
      if (st.travel > 4) st.moved = true
      spin(dx * K, dy * K)
      st.vx = st.vx * 0.5 + dx * K * 0.5
      st.vy = st.vy * 0.5 + dy * K * 0.5
    },
    onPointerUp: end,
    onPointerCancel: end,
    onClickCapture(e) {
      if (s.current.dragged) { e.preventDefault(); e.stopPropagation(); s.current.dragged = false }
    },
  }
  return { ref, bind, dragging }
}
