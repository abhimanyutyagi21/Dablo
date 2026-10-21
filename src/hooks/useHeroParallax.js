import { useRef } from 'react'
import { finePointer, reducedMotion } from './motion'

// Gentle pointer parallax for the hero's orbit scene and dashboard.
export default function useHeroParallax() {
  const sceneRef = useRef(null)
  const dashRef = useRef(null)
  const heroProps = {
    onPointerMove(e) {
      if (reducedMotion() || !finePointer()) return
      const r = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      sceneRef.current?.style.setProperty('--px', (x * 18).toFixed(2) + 'px')
      sceneRef.current?.style.setProperty('--py', (y * 14).toFixed(2) + 'px')
      if (dashRef.current) dashRef.current.style.transform = `perspective(1500px) rotateX(${(2 - y * 3).toFixed(2)}deg) rotateY(${(-2 + x * 4).toFixed(2)}deg)`
    },
    onPointerLeave() {
      if (dashRef.current) dashRef.current.style.transform = ''
      sceneRef.current?.style.setProperty('--px', '0px')
      sceneRef.current?.style.setProperty('--py', '0px')
    },
  }
  return { heroProps, sceneRef, dashRef }
}
