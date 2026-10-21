import { useLayoutEffect } from 'react'

// The landing page and the app ship separate global stylesheets (same class
// names, different rules). Mount one <style> per route and remove it on exit.
export default function useScopedStyles(css, id) {
  useLayoutEffect(() => {
    const el = document.createElement('style')
    el.dataset.scope = id
    el.textContent = css
    document.head.appendChild(el)
    return () => el.remove()
  }, [css, id])
}
