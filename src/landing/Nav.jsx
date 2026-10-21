import { useState } from 'react'
import { useOpenApp } from './useOpenApp'

const LINKS = [['#product', 'Product'], ['#why', 'Why it converts'], ['#how', 'How it works'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const openApp = useOpenApp()
  return (
    <div className="nav-shell">
      <nav className="nav" aria-label="Main navigation">
        <a href="#top" className="brand" aria-label="Dablo home">dablo<span>.</span></a>
        <div className={'nav-links' + (open ? ' open' : '')} id="navLinks">
          {LINKS.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        </div>
        <div className="nav-actions">
          <button className="btn" onClick={openApp}>Get started <span className="arrow">↗</span></button>
          <button className="menu-btn" aria-expanded={open} aria-controls="navLinks" onClick={() => setOpen((o) => !o)}>Menu</button>
        </div>
      </nav>
    </div>
  )
}
