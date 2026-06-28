// Sett env vars FØR noen moduler lastes – database.js bruker DB_PATH
process.env.NODE_ENV   = 'test'
process.env.DB_PATH    = ':memory:'
process.env.JWT_SECRET = 'test-hemmelig-nokkel-for-ziimo-2024'
process.env.PORT       = '3099'
