import useTrackball from '../hooks/useTrackball'

// The empty-state badge, as a tile you can flip around.
export default function Coin3D({ glyph = '✳' }) {
  const { ref, bind } = useTrackball({ x: 0.12, y: -0.25 })
  return (
    <div ref={ref} className="empty-orbit coin3d" {...bind} aria-hidden="true">
      <span className="coin-face">{glyph}</span>
      <span className="coin-face back">{glyph}</span>
    </div>
  )
}
