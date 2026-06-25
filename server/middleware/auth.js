const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  if (!token) {
    return res.status(401).json({ error: 'Autentisering kreves.' })
  }

  try {
    req.bruker = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Ugyldig eller utløpt token.' })
  }
}

module.exports = requireAuth
