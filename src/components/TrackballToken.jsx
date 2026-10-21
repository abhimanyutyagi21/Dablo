import { Children, cloneElement, useRef } from 'react'
import useTrackball from '../hooks/useTrackball'

// Social platform logo you can spin in any direction; a click (not a drag) still opens the link.
let counter = 0
export default function TrackballToken({ className = '', children, ...rest }) {
  const index = useRef(null)
  if (index.current === null) index.current = counter++
  const { ref, bind, dragging } = useTrackball({ x: 0.2, y: (index.current % 2 ? 1 : -1) * 0.32 })
  const front = Children.only(children)
  return (
    <a ref={ref} className={className + (dragging ? ' is-dragging' : '')} {...rest} {...bind}>
      {front}
      {cloneElement(front, { className: 'logo-back', 'aria-hidden': 'true', key: 'back' })}
    </a>
  )
}
