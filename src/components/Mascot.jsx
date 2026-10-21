import { useEffect, useRef } from 'react'
import { finePointer, reducedMotion } from '../hooks/motion'

// Mascots turn (in 3D) to look toward the cursor, and hop when clicked.
export default function Mascot({ children, className = '', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion() || !finePointer()) return
    const el = ref.current
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight
        el.style.setProperty('--ry', `${Math.max(-1, Math.min(1, dx * 2)) * 18}deg`)
        el.style.setProperty('--rx', `${Math.max(-1, Math.min(1, dy * 2)) * -12}deg`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf) }
  }, [])
  const hop = (e) => {
    const el = e.currentTarget
    el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop')
  }
  return <div ref={ref} className={className} onClick={hop} onAnimationEnd={(e) => e.animationName === 'mascot-hop' && e.currentTarget.classList.remove('hop')} {...rest}>{children}</div>
}
