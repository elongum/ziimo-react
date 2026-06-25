const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db/database')

const SALT_ROUNDS = 12
const EPOST_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── POST /api/auth/register ────────────────────
router.post('/auth/register', async (req, res) => {
  const { navn, epost, passord } = req.body ?? {}

  if (!navn || typeof navn !== 'string' || navn.trim().length < 2) {
    return res.status(400).json({ error: 'Navn må være minst 2 tegn.' })
  }
  if (!epost || !EPOST_REGEX.test(epost)) {
    return res.status(400).json({ error: 'Ugyldig epostadresse.' })
  }
  if (!passord || passord.length < 8) {
    return res.status(400).json({ error: 'Passord må være minst 8 tegn.' })
  }

  try {
    const passord_hash = await bcrypt.hash(passord, SALT_ROUNDS)

    db.prepare(
      'INSERT INTO brukere (navn, epost, passord_hash) VALUES (?, ?, ?)'
    ).run(navn.trim(), epost.toLowerCase(), passord_hash)

    res.status(201).json({ melding: 'Bruker opprettet.' })
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Epostadressen er allerede registrert.' })
    }
    throw err
  }
})

// ── POST /api/auth/login ───────────────────────
router.post('/auth/login', async (req, res) => {
  const { epost, passord } = req.body ?? {}

  if (!epost || !passord) {
    return res.status(400).json({ error: 'Epost og passord er påkrevd.' })
  }

  const bruker = db.prepare(
    'SELECT id, navn, rolle, passord_hash FROM brukere WHERE epost = ?'
  ).get(epost.toLowerCase())

  // Constant-time comparison even when user not found
  const dummyHash = '$2b$12$invalidhashfortimingnormalization000000000000000000000'
  const passordHash = bruker?.passord_hash ?? dummyHash
  const riktig = await bcrypt.compare(passord, passordHash)

  if (!bruker || !riktig) {
    return res.status(401).json({ error: 'Feil epost eller passord.' })
  }

  const token = jwt.sign(
    { id: bruker.id, navn: bruker.navn, rolle: bruker.rolle },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({
    token,
    bruker: { id: bruker.id, navn: bruker.navn, rolle: bruker.rolle },
  })
})

module.exports = router
