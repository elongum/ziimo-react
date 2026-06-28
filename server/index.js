require('dotenv').config()

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('replace_this')) {
  console.error('FEIL: JWT_SECRET er ikke satt eller er placeholder-verdien. Sett en ekte verdi i .env.')
  process.exit(1)
}

const app  = require('./app')
const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
  console.log(`Ziimo server running on http://localhost:${PORT}`)
})

function shutdown(signal) {
  console.log(`\n${signal} mottatt – stenger serveren...`)
  server.close(() => { console.log('Server stengt.'); process.exit(0) })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
