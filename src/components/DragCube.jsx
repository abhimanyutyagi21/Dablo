import useTrackball from '../hooks/useTrackball'

const FACES = [['Content', '▤'], ['Clicks', '⌁'], ['Revenue', '↗'], ['Insights', '✳'], ['Campaigns', '◉'], ['Frameworks', '▧']]
const T = ['rotateY(0deg)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)']

// Small draggable cube — one face per part of the Dablo workflow.
export default function DragCube({ size = 58, idle = 0.006 }) {
  const { ref, bind, dragging } = useTrackball({ x: -0.5, y: 0.7, idle })
  return (
    <div className="dcube-scene" style={{ '--s': size + 'px' }} role="img" aria-label="Draggable cube showing Dablo's content, clicks and revenue">
      <div ref={ref} className={'dcube' + (dragging ? ' is-dragging' : '')} {...bind}>
        {FACES.map(([label, icon], n) => (
          <div key={label} className="dcube-face" title={label} style={{ transform: `${T[n]} translateZ(calc(var(--s) / 2))` }}>{icon}</div>
        ))}
      </div>
    </div>
  )
}
