const express = require('express')
const router = express.Router()
const db = require('../db/database')
const requireAuth = require('../middleware/auth')

// ── GET /api/oppdrag – åpen ────────────────────
router.get('/oppdrag', (req, res) => {
  const oppdrag = db.prepare('SELECT * FROM oppdrag ORDER BY id').all()
  res.json(oppdrag)
})

// ── POST /api/oppdrag – krever auth ───────────
router.post('/oppdrag', requireAuth, (req, res) => {
  const { tittel, poeng, ikon, varighet, sted, kategori, beskrivelse } = req.body ?? {}

  if (!tittel || typeof tittel !== 'string' || tittel.trim().length === 0) {
    return res.status(400).json({ error: 'Tittel er påkrevd.' })
  }
  if (!Number.isInteger(poeng) || poeng < 1) {
    return res.status(400).json({ error: 'Poeng må være et positivt heltall.' })
  }

  const result = db.prepare(`
    INSERT INTO oppdrag (tittel, poeng, ikon, varighet, sted, kategori, beskrivelse)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    tittel.trim(),
    poeng,
    ikon    ?? null,
    varighet ?? null,
    sted     ?? null,
    kategori ?? null,
    beskrivelse ?? null,
  )

  const nyttOppdrag = db.prepare('SELECT * FROM oppdrag WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(nyttOppdrag)
})

// ── PUT /api/oppdrag/:id – krever auth ────────
router.put('/oppdrag/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Ugyldig ID.' })
  }

  const eksisterende = db.prepare('SELECT id FROM oppdrag WHERE id = ?').get(id)
  if (!eksisterende) {
    return res.status(404).json({ error: 'Oppdrag ikke funnet.' })
  }

  const { tittel, poeng, ikon, varighet, sted, kategori, beskrivelse } = req.body ?? {}

  if (tittel !== undefined && (typeof tittel !== 'string' || tittel.trim().length === 0)) {
    return res.status(400).json({ error: 'Tittel kan ikke være tom.' })
  }
  if (poeng !== undefined && (!Number.isInteger(poeng) || poeng < 1)) {
    return res.status(400).json({ error: 'Poeng må være et positivt heltall.' })
  }

  db.prepare(`
    UPDATE oppdrag
    SET tittel      = COALESCE(?, tittel),
        poeng       = COALESCE(?, poeng),
        ikon        = COALESCE(?, ikon),
        varighet    = COALESCE(?, varighet),
        sted        = COALESCE(?, sted),
        kategori    = COALESCE(?, kategori),
        beskrivelse = COALESCE(?, beskrivelse)
    WHERE id = ?
  `).run(
    tittel?.trim() ?? null,
    poeng   ?? null,
    ikon    ?? null,
    varighet ?? null,
    sted     ?? null,
    kategori ?? null,
    beskrivelse ?? null,
    id,
  )

  res.json(db.prepare('SELECT * FROM oppdrag WHERE id = ?').get(id))
})

// ── DELETE /api/oppdrag/:id – krever auth ─────
router.delete('/oppdrag/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Ugyldig ID.' })
  }

  const result = db.prepare('DELETE FROM oppdrag WHERE id = ?').run(id)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Oppdrag ikke funnet.' })
  }

  res.status(204).send()
})

module.exports = router
