require('dotenv').config()

const express = require('express')
const helmet  = require('helmet')
const cors    = require('cors')
const morgan  = require('morgan')
const rateLimit = require('express-rate-limit')

// ── Startup-validering ─────────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('replace_this')) {
  console.error('FEIL: JWT_SECRET er ikke satt eller er placeholder-verdien. Sett en ekte verdi i .env.')
  process.exit(1)
}

// Initialiser databasen ved oppstart (oppretter tabeller + seed)
require('./db/database')

const healthRouter     = require('./routes/health')
const authRouter       = require('./routes/auth')
const oppdragRouter    = require('./routes/oppdrag')
const progresjonRouter = require('./routes/progresjon')

const app  = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// ── Request logging ────────────────────────────
app.use(morgan('dev'))

// ── Security headers ───────────────────────────
app.use(helmet())

// ── CORS ───────────────────────────────────────
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Body parsing ───────────────────────────────
app.use(express.json({ limit: '10kb' }))

// ── Global rate limit – 100 req / 15 min ──────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}))

// ── Strengere limit på auth-ruter (10 forsøk / 15 min) ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'For mange innloggingsforsøk. Prøv igjen om 15 minutter.' },
})
app.use('/api/auth', authLimiter)

// ── Routes ─────────────────────────────────────
app.use('/api', healthRouter)
app.use('/api', authRouter)
app.use('/api', oppdragRouter)
app.use('/api', progresjonRouter)

// ── 404 ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ── Global error handler ───────────────────────
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Ugyldig JSON i request body.' })
  }
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start + graceful shutdown ──────────────────
const server = app.listen(PORT, () => {
  console.log(`Ziimo server running on http://localhost:${PORT}`)
})

function shutdown(signal) {
  console.log(`\n${signal} mottatt – stenger serveren...`)
  server.close(() => {
    console.log('Server stengt.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
