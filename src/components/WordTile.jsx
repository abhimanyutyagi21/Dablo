import { useEffect, useState } from 'react'
import { reducedMotion } from '../hooks/motion'

export default function WordTile({ words, ...rest }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reducedMotion() || words.length < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2200)
    return () => clearInterval(t)
  }, [words.length])
  return (
    <span {...rest}>
      {words.map((w, n) => <span key={n} className={n === i ? 'active' : undefined}>{w}</span>)}
    </span>
  )
}
