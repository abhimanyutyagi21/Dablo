export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const finePointer = () => window.matchMedia('(pointer:fine)').matches

// Pointer tilt handlers for cards (sets transform + glare position directly, no re-render).
export function tiltHandlers(max = 3) {
  return {
    onPointerMove(e) {
      if (!finePointer() || reducedMotion()) return
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-3px)`
      el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(0)}%`)
      el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(0)}%`)
    },
    onPointerLeave(e) {
      e.currentTarget.style.transform = ''
    },
  }
}
