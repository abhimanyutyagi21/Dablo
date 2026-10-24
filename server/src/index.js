import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from './config.js'
import './db.js'
import { requireAuth } from './lib/session.js'
import authRoutes from './routes/auth.js'
import workspaceRoutes from './routes/workspace.js'
import redirectRoutes from './routes/redirect.js'
import integrationRoutes from './routes/integrations.js'
import insightRoutes from './routes/insights.js'
import { startScheduler } from './integrations/scheduler.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist')

const app = express()
app.disable('x-powered-by')
if (config.trustProxy) app.set('trust proxy', config.trustProxy)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https://images.unsplash.com'],
    },
  },
}))
app.use(cors({ origin: config.clientOrigin, credentials: true }))
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

// Public short links: /r/:slug -> log click -> redirect
app.use('/r', rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }), redirectRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in a few minutes.' } }), authRoutes)
app.use('/api/integrations', requireAuth, integrationRoutes)
app.use('/api/insights', requireAuth, insightRoutes)
app.use('/api', requireAuth, workspaceRoutes)

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }))
app.use(express.static(dist))
app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')))
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' })
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on the server.' })
})

app.listen(config.port, () => {
  console.log(`Dablo API listening on http://localhost:${config.port}`)
  startScheduler()
})
