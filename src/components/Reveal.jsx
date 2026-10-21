import { useEffect, useRef, useState } from 'react'
import { reducedMotion, tiltHandlers } from '../hooks/motion'

// Scroll-reveal (and optional 3D tilt) wrapper. Renders any element via `as`.
export default function Reveal({ as: Tag = 'div', tilt = false, delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  const motion = !reducedMotion()

  useEffect(() => {
    if (!motion || !('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); io.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [motion])

  const cls = [className, motion && 'reveal', seen && 'visible'].filter(Boolean).join(' ')
  const st = delay ? { ...style, transitionDelay: `${delay}ms` } : style
  return (
    <Tag ref={ref} className={cls} style={st} {...(tilt ? tiltHandlers(3) : {})} {...rest}>
      {children}
    </Tag>
  )
}
