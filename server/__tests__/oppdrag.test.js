'use strict'

const request = require('supertest')
const app     = require('../app')

async function hentToken() {
  const epost  = 'oppdrag-test@ziimo.no'
  const passord = 'Hemmelig123'
  await request(app).post('/api/auth/register')
    .send({ navn: 'Oppdrag Tester', epost, passord })
  const res = await request(app).post('/api/auth/login').send({ epost, passord })
  return res.body.token
}

describe('GET /api/oppdrag', () => {
  it('returnerer seeded oppdrag-liste uten token', async () => {
    const res = await request(app).get('/api/oppdrag')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(5)
    expect(res.body[0]).toMatchObject({ tittel: expect.any(String), poeng: expect.any(Number) })
  })
})

describe('POST /api/oppdrag', () => {
  it('returnerer 401 uten token', async () => {
    const res = await request(app)
      .post('/api/oppdrag')
      .send({ tittel: 'Test', poeng: 5 })
    expect(res.status).toBe(401)
  })

  it('oppretter nytt oppdrag med gyldig token', async () => {
    const token = await hentToken()
    const res   = await request(app)
      .post('/api/oppdrag')
      .set('Authorization', `Bearer ${token}`)
      .send({ tittel: 'Vann blomstene', poeng: 8, ikon: '🌸', varighet: 'Rask', sted: 'Inne', kategori: 'natur' })
    expect(res.status).toBe(201)
    expect(res.body.tittel).toBe('Vann blomstene')
    expect(res.body.id).toBeDefined()
  })

  it('returnerer 400 når poeng mangler', async () => {
    const token = await hentToken()
    const res   = await request(app)
      .post('/api/oppdrag')
      .set('Authorization', `Bearer ${token}`)
      .send({ tittel: 'Mangler poeng' })
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/oppdrag/:id', () => {
  it('oppdaterer oppdrag med gyldig token', async () => {
    const token = await hentToken()
    const res   = await request(app)
      .put('/api/oppdrag/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ poeng: 99 })
    expect(res.status).toBe(200)
    expect(res.body.poeng).toBe(99)
  })

  it('returnerer 404 for ikke-eksisterende oppdrag', async () => {
    const token = await hentToken()
    const res   = await request(app)
      .put('/api/oppdrag/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({ poeng: 10 })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/oppdrag/:id', () => {
  it('sletter oppdrag og returnerer 204', async () => {
    const token = await hentToken()
    // Opprett et oppdrag vi kan slette
    const lagd = await request(app)
      .post('/api/oppdrag')
      .set('Authorization', `Bearer ${token}`)
      .send({ tittel: 'Slett meg', poeng: 1 })
    const res = await request(app)
      .delete(`/api/oppdrag/${lagd.body.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(204)
  })

  it('returnerer 404 for allerede slettet oppdrag', async () => {
    const token = await hentToken()
    const res   = await request(app)
      .delete('/api/oppdrag/9999')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })
})
