import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev the React app (5173) and API (4000) look like one origin, so the
// httpOnly session cookie works without any CORS or cookie tweaks.
// /api = JSON API, /r/:slug = public tracking-link redirects
const proxy = { '/api': 'http://localhost:4000', '^/r/': 'http://localhost:4000' }

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
})
