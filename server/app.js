'use strict'

const express   = require('express')
const helmet    = require('helmet')
const cors      = require('cors')
const rateLimit = require('express-rate-limit')

// Initialiser databasen (bruker process.env.DB_PATH – overstyres av tester)
require('./db/database')

const healthRouter     = require('./routes/health')
const authRouter       = require('./routes/auth')
const oppdragRouter    = require('./routes/oppdrag')
const progresjonRouter = require('./routes/progresjon')

const app         = express()
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Logg ikke under testing
if (process.env.NODE_ENV !== 'test') {
  const morgan = require('morgan')
  app.use(morgan('dev'))
}

app.use(helmet())
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '10kb' }))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}))

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'For mange innloggingsforsøk. Prøv igjen om 15 minutter.' },
}))

app.use('/api', healthRouter)
app.use('/api', authRouter)
app.use('/api', oppdragRouter)
app.use('/api', progresjonRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Ugyldig JSON i request body.' })
  }
  if (process.env.NODE_ENV !== 'test') console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app
