'use strict'

const request = require('supertest')
const app     = require('../app')

const BRUKER = { navn: 'Test Bruker', epost: 'test@ziimo.no', passord: 'Hemmelig123' }

describe('POST /api/auth/register', () => {
  it('oppretter ny bruker og returnerer 201', async () => {
    const res = await request(app).post('/api/auth/register').send(BRUKER)
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ melding: 'Bruker opprettet.' })
  })

  it('returnerer 409 ved duplikat epost', async () => {
    await request(app).post('/api/auth/register').send(BRUKER)
    const res = await request(app).post('/api/auth/register').send(BRUKER)
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/allerede registrert/i)
  })

  it('returnerer 400 når passord er for kort', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...BRUKER, epost: 'annen@test.no', passord: 'kort' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/passord/i)
  })

  it('returnerer 400 ved ugyldig epost', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...BRUKER, epost: 'ikke-en-epost' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/epost/i)
  })

  it('returnerer 400 når navn er for kort', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...BRUKER, epost: 'ny@test.no', navn: 'X' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(BRUKER)
  })

  it('returnerer token og brukerinfo ved korrekt passord', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ epost: BRUKER.epost, passord: BRUKER.passord })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.bruker.navn).toBe(BRUKER.navn)
    expect(res.body.bruker.passord_hash).toBeUndefined()
  })

  it('returnerer 401 ved feil passord', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ epost: BRUKER.epost, passord: 'feilPassord99' })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/feil epost eller passord/i)
  })

  it('returnerer 401 for ukjent epost', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ epost: 'finnesikke@test.no', passord: BRUKER.passord })
    expect(res.status).toBe(401)
  })
})
