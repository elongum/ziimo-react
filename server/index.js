require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

// Initialiser databasen ved oppstart (oppretter tabeller + seed)
require('./db/database')

const healthRouter  = require('./routes/health')
const oppdragRouter = require('./routes/oppdrag')
const authRouter    = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3001

// ── Security headers ───────────────────────────
app.use(helmet())

// ── CORS ───────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Body parsing ───────────────────────────────
app.use(express.json({ limit: '10kb' }))

// ── Rate limiting – 100 req / 15 min per IP ───
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}))

// ── Routes ─────────────────────────────────────
app.use('/api', healthRouter)
app.use('/api', authRouter)
app.use('/api', oppdragRouter)

// ── 404 ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ── Global error handler ───────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Ziimo server running on http://localhost:${PORT}`)
})
