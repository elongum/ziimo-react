const express = require('express')
const router = express.Router()
const db = require('../db/database')
const requireAuth = require('../middleware/auth')

const KOLONNER = 'id, tittel, poeng, ikon, varighet, sted, kategori, beskrivelse'

// Prepared statements lages én gang ved moduloppstart
const stmts = {
  getAll:  db.prepare(`SELECT ${KOLONNER} FROM oppdrag ORDER BY id`),
  getById: db.prepare(`SELECT ${KOLONNER} FROM oppdrag WHERE id = ?`),
  exists:  db.prepare('SELECT id FROM oppdrag WHERE id = ?'),
  insert:  db.prepare(`
    INSERT INTO oppdrag (tittel, poeng, ikon, varighet, sted, kategori, beskrivelse)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  update: db.prepare(`
    UPDATE oppdrag
    SET tittel      = COALESCE(?, tittel),
        poeng       = COALESCE(?, poeng),
        ikon        = COALESCE(?, ikon),
        varighet    = COALESCE(?, varighet),
        sted        = COALESCE(?, sted),
        kategori    = COALESCE(?, kategori),
        beskrivelse = COALESCE(?, beskrivelse)
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM oppdrag WHERE id = ?'),
}

function validerOppdragId(req, res) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Ugyldig ID.' })
    return null
  }
  return id
}

// ── GET /api/oppdrag – åpen ────────────────────
router.get('/oppdrag', (req, res) => {
  res.json(stmts.getAll.all())
})

// ── POST /api/oppdrag – krever auth ───────────
router.post('/oppdrag', requireAuth, (req, res) => {
  const { tittel, poeng, ikon, varighet, sted, kategori, beskrivelse } = req.body ?? {}

  if (!tittel || typeof tittel !== 'string' || tittel.trim().length === 0) {
    return res.status(400).json({ error: 'Tittel er påkrevd.' })
  }
  if (tittel.trim().length > 100) {
    return res.status(400).json({ error: 'Tittel kan ikke være lengre enn 100 tegn.' })
  }
  if (!Number.isInteger(poeng) || poeng < 1 || poeng > 1000) {
    return res.status(400).json({ error: 'Poeng må være et heltall mellom 1 og 1000.' })
  }

  const result = stmts.insert.run(
    tittel.trim(),
    poeng,
    ikon        ?? null,
    varighet    ?? null,
    sted        ?? null,
    kategori    ?? null,
    beskrivelse ?? null,
  )

  res.status(201).json(stmts.getById.get(result.lastInsertRowid))
})

// ── PUT /api/oppdrag/:id – krever auth ────────
router.put('/oppdrag/:id', requireAuth, (req, res) => {
  const id = validerOppdragId(req, res)
  if (id === null) return

  if (!stmts.exists.get(id)) {
    return res.status(404).json({ error: 'Oppdrag ikke funnet.' })
  }

  const { tittel, poeng, ikon, varighet, sted, kategori, beskrivelse } = req.body ?? {}

  if (tittel !== undefined) {
    if (typeof tittel !== 'string' || tittel.trim().length === 0) {
      return res.status(400).json({ error: 'Tittel kan ikke være tom.' })
    }
    if (tittel.trim().length > 100) {
      return res.status(400).json({ error: 'Tittel kan ikke være lengre enn 100 tegn.' })
    }
  }
  if (poeng !== undefined && (!Number.isInteger(poeng) || poeng < 1 || poeng > 1000)) {
    return res.status(400).json({ error: 'Poeng må være et heltall mellom 1 og 1000.' })
  }

  stmts.update.run(
    tittel?.trim() ?? null,
    poeng          ?? null,
    ikon           ?? null,
    varighet       ?? null,
    sted           ?? null,
    kategori       ?? null,
    beskrivelse    ?? null,
    id,
  )

  res.json(stmts.getById.get(id))
})

// ── DELETE /api/oppdrag/:id – krever auth ─────
router.delete('/oppdrag/:id', requireAuth, (req, res) => {
  const id = validerOppdragId(req, res)
  if (id === null) return

  const result = stmts.delete.run(id)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Oppdrag ikke funnet.' })
  }

  res.status(204).send()
})

module.exports = router
