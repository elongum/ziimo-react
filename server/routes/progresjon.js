const express     = require('express')
const router      = express.Router()
const db          = require('../db/database')
const requireAuth = require('../middleware/auth')

const DATO_REGEX = /^\d{4}-\d{2}-\d{2}$/

// Prepared statements – lages én gang ved moduloppstart
const stmts = {
  hentAlle: db.prepare(`
    SELECT oppdrag_id, fullfort_dato
    FROM   progresjon
    WHERE  bruker_id = ?
    ORDER  BY fullfort_dato
  `),
  settFullfort: db.prepare(`
    INSERT OR IGNORE INTO progresjon (bruker_id, oppdrag_id, fullfort_dato)
    VALUES (?, ?, ?)
  `),
  fjernFullfort: db.prepare(`
    DELETE FROM progresjon
    WHERE  bruker_id = ? AND oppdrag_id = ?
  `),
  eksisterer: db.prepare(`
    SELECT 1 FROM oppdrag WHERE id = ?
  `),
}

// ── GET /api/progresjon ────────────────────────
router.get('/progresjon', requireAuth, (req, res) => {
  res.json(stmts.hentAlle.all(req.bruker.id))
})

// ── POST /api/progresjon ───────────────────────
router.post('/progresjon', requireAuth, (req, res) => {
  const oppdragId    = Number(req.body?.oppdrag_id)
  const klientDato   = req.body?.fullfort_dato
  const serverDato   = new Date().toISOString().slice(0, 10)

  if (!Number.isInteger(oppdragId) || oppdragId < 1) {
    return res.status(400).json({ error: 'Ugyldig oppdrag_id.' })
  }
  if (!stmts.eksisterer.get(oppdragId)) {
    return res.status(404).json({ error: 'Oppdrag ikke funnet.' })
  }

  // Bruk klientens dato hvis den er gyldig ISO-dato, ellers serverens dato
  const dato = (klientDato && DATO_REGEX.test(klientDato)) ? klientDato : serverDato

  stmts.settFullfort.run(req.bruker.id, oppdragId, dato)

  const rad = stmts.hentAlle.all(req.bruker.id)
    .find(r => r.oppdrag_id === oppdragId)

  res.status(201).json(rad)
})

// ── DELETE /api/progresjon/:oppdragId ─────────
router.delete('/progresjon/:oppdragId', requireAuth, (req, res) => {
  const oppdragId = Number(req.params.oppdragId)

  if (!Number.isInteger(oppdragId) || oppdragId < 1) {
    return res.status(400).json({ error: 'Ugyldig oppdrag_id.' })
  }

  const result = stmts.fjernFullfort.run(req.bruker.id, oppdragId)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Progresjon ikke funnet.' })
  }

  res.status(204).send()
})

module.exports = router
