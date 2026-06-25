const express = require('express')
const router = express.Router()
const oppdrag = require('../data/oppdrag')

router.get('/oppdrag', (req, res) => {
  res.json(oppdrag)
})

module.exports = router
