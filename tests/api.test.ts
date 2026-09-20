import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { Server } from 'node:http'
import { app } from '../src/app'
import { prisma } from '../src/lib/prisma'

describe('Product Catalog API Test Suite', () => {
  let server: Server
  let baseUrl: string

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address()
        if (typeof address === 'object' && address !== null) {
          baseUrl = `http://localhost:${address.port}`
        }
        resolve()
      })
    })
  })

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await prisma.$disconnect()
  })

  test('GET / should return 200 with status ok, timestamp and docs link', async () => {
    const res = await fetch(`${baseUrl}/`)
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.strictEqual(data.status, 'ok')
    assert.strictEqual(data.docs, '/api-docs')
    assert.ok(data.timestamp)
  })

  test('GET /api-docs should return 200/301 serving Swagger UI', async () => {
    const res = await fetch(`${baseUrl}/api-docs/`)
    assert.strictEqual(res.status, 200)
    const html = await res.text()
    assert.ok(html.includes('Swagger UI'))
  })

  test('GET /docs should redirect to /api-docs', async () => {
    const res = await fetch(`${baseUrl}/docs`, { redirect: 'manual' })
    assert.strictEqual(res.status, 302)
    assert.strictEqual(res.headers.get('location'), '/api-docs')
  })

  test('GET /products should return 200 and an array of products', async () => {
    const res = await fetch(`${baseUrl}/products`)
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.ok(Array.isArray(data))
    assert.ok(data.length >= 5)
    assert.ok(data[0].id)
    assert.ok(data[0].title)
    assert.ok(data[0].price)
  })

  test('GET /products/1 should return 200 with the matching product', async () => {
    const res = await fetch(`${baseUrl}/products/1`)
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.strictEqual(data.id, 1)
    assert.strictEqual(data.title, 'MacBook Pro 14')
  })

  test('GET /products/99999 (non-existing ID) should return 404', async () => {
    const res = await fetch(`${baseUrl}/products/99999`)
    assert.strictEqual(res.status, 404)
    const data = await res.json()
    assert.strictEqual(data.error, 'Produto não encontrado')
  })

  test('GET /products/abc (non-numeric ID) should return 400', async () => {
    const res = await fetch(`${baseUrl}/products/abc`)
    assert.strictEqual(res.status, 400)
    const data = await res.json()
    assert.ok(data.error.includes('ID inválido'))
  })

  test('GET /unknown-route should return 404', async () => {
    const res = await fetch(`${baseUrl}/unknown-route`)
    assert.strictEqual(res.status, 404)
    const data = await res.json()
    assert.strictEqual(data.error, 'Rota não encontrada')
  })
})
