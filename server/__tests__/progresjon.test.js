'use strict'

const request = require('supertest')
const app     = require('../app')

async function hentToken(epost = 'prog-test@ziimo.no') {
  const passord = 'Hemmelig123'
  await request(app).post('/api/auth/register')
    .send({ navn: 'Progresjon Tester', epost, passord })
  const res = await request(app).post('/api/auth/login').send({ epost, passord })
  return res.body.token
}

describe('GET /api/progresjon', () => {
  it('returnerer 401 uten token', async () => {
    const res = await request(app).get('/api/progresjon')
    expect(res.status).toBe(401)
  })

  it('returnerer tom liste for ny bruker', async () => {
    const token = await hentToken('tom@ziimo.no')
    const res   = await request(app)
      .get('/api/progresjon')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/progresjon', () => {
  it('returnerer 401 uten token', async () => {
    const res = await request(app)
      .post('/api/progresjon')
      .send({ oppdrag_id: 1 })
    expect(res.status).toBe(401)
  })

  it('markerer oppdrag som fullført', async () => {
    const token = await hentToken('marker@ziimo.no')
    const res   = await request(app)
      .post('/api/progresjon')
      .set('Authorization', `Bearer ${token}`)
      .send({ oppdrag_id: 1, fullfort_dato: '2024-06-15' })
    expect(res.status).toBe(201)
    expect(res.body.oppdrag_id).toBe(1)
    expect(res.body.fullfort_dato).toBe('2024-06-15')
  })

  it('er idempotent – duplikat ignoreres', async () => {
    const token = await hentToken('idem@ziimo.no')
    await request(app)
      .post('/api/progresjon')
      .set('Authorization', `Bearer ${token}`)
      .send({ oppdrag_id: 2 })
    const res = await request(app)
      .post('/api/progresjon')
      .set('Authorization', `Bearer ${token}`)
      .send({ oppdrag_id: 2 })
    expect(res.status).toBe(201)
    const liste = await request(app)
      .get('/api/progresjon')
      .set('Authorization', `Bearer ${token}`)
    expect(liste.body.filter(r => r.oppdrag_id === 2).length).toBe(1)
  })

  it('returnerer 404 for ikke-eksisterende oppdrag', async () => {
    const token = await hentToken('notfound@ziimo.no')
    const res   = await request(app)
      .post('/api/progresjon')
      .set('Authorization', `Bearer ${token}`)
      .send({ oppdrag_id: 9999 })
    expect(res.status).toBe(404)
  })

  it('bruker kan ikke se en annens progresjon', async () => {
    const tokenA = await hentToken('bruker-a@ziimo.no')
    const tokenB = await hentToken('bruker-b@ziimo.no')
    await request(app)
      .post('/api/progresjon')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ oppdrag_id: 3 })
    const res = await request(app)
      .get('/api/progresjon')
      .set('Authorization', `Bearer ${tokenB}`)
    expect(res.body.find(r => r.oppdrag_id === 3)).toBeUndefined()
  })
})

describe('DELETE /api/progresjon/:oppdragId', () => {
  it('fjerner fullføring og returnerer 204', async () => {
    const token = await hentToken('slett@ziimo.no')
    await request(app)
      .post('/api/progresjon')
      .set('Authorization', `Bearer ${token}`)
      .send({ oppdrag_id: 4 })
    const res = await request(app)
      .delete('/api/progresjon/4')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(204)
    const liste = await request(app)
      .get('/api/progresjon')
      .set('Authorization', `Bearer ${token}`)
    expect(liste.body.find(r => r.oppdrag_id === 4)).toBeUndefined()
  })

  it('returnerer 404 når progresjon ikke finnes', async () => {
    const token = await hentToken('ingenrad@ziimo.no')
    const res   = await request(app)
      .delete('/api/progresjon/5')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })
})
