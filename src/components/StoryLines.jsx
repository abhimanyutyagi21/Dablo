import { useEffect, useRef, useState } from 'react'

function Line({ text, initial }) {
  const ref = useRef(null)
  const [on, setOn] = useState(initial)
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setOn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true) }, { rootMargin: '-8% 0px -25% 0px', threshold: 0.15 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return <span ref={ref} className={'sl' + (on ? ' on' : '')}>{text}</span>
}

// Sentences that darken as they scroll into view.
export default function StoryLines({ lines }) {
  return (
    <div className="story-lines" id="storyLines">
      {lines.map((t, i) => <span key={i}><Line text={t} initial={i === 0} />{' '}</span>)}
    </div>
  )
}
