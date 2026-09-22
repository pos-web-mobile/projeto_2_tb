import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { Server } from 'node:http'
import { Prisma } from '@prisma/client'
import { app } from '../src/app'
import { prisma } from '../src/lib/prisma'

describe('Product Catalog API Test Suite (CRUD + Zod + Prisma P2025)', () => {
  let server: Server
  let baseUrl: string

  const mockProduct = {
    id: 1,
    title: 'MacBook Pro 14',
    description: 'Chip Apple M2 Pro, 16GB de memória unificada, 512GB SSD, Tela Liquid Retina XDR',
    price: 15999.0,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  before(async () => {
    // Mock dos métodos do Prisma para garantir testes rápidos, determinísticos e independentes de banco externo
    ;(prisma.product as any).findMany = async () => [mockProduct]
    ;(prisma.product as any).findUnique = async ({ where }: { where: { id: number } }) => {
      if (where.id === 1) return mockProduct
      return null
    }
    ;(prisma.product as any).create = async ({ data }: { data: any }) => {
      return { id: 2, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    }
    ;(prisma.product as any).update = async ({ where, data }: { where: { id: number }; data: any }) => {
      if (where.id === 1) {
        return { ...mockProduct, ...data, updatedAt: new Date().toISOString() }
      }
      throw new Prisma.PrismaClientKnownRequestError('An operation failed because it depends on one or more records that were required but not found.', {
        code: 'P2025',
        clientVersion: '6.19.3',
      })
    }
    ;(prisma.product as any).delete = async ({ where }: { where: { id: number } }) => {
      if (where.id === 1) return mockProduct
      throw new Prisma.PrismaClientKnownRequestError('An operation failed because it depends on one or more records that were required but not found.', {
        code: 'P2025',
        clientVersion: '6.19.3',
      })
    }

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
  })

  // --- Health check & Swagger ---
  test('GET / should return 200 with status ok and endpoints info', async () => {
    const res = await fetch(`${baseUrl}/`)
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.strictEqual(data.status, 'ok')
    assert.strictEqual(data.docs, '/api-docs')
    assert.ok(data.timestamp)
  })

  test('GET /api-docs should return 200 serving Swagger UI', async () => {
    const res = await fetch(`${baseUrl}/api-docs/`)
    assert.strictEqual(res.status, 200)
    const html = await res.text()
    assert.ok(html.includes('Swagger UI'))
  })

  // --- GET /api/products ---
  test('GET /api/products should return 200 and array of products', async () => {
    const res = await fetch(`${baseUrl}/api/products`)
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.ok(Array.isArray(data))
    assert.ok(data.length >= 1)
    assert.strictEqual(data[0].id, 1)
    assert.strictEqual(data[0].title, 'MacBook Pro 14')
  })

  // --- GET /api/products/:id ---
  test('GET /api/products/1 should return 200 with matching product', async () => {
    const res = await fetch(`${baseUrl}/api/products/1`)
    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.strictEqual(data.id, 1)
    assert.strictEqual(data.title, 'MacBook Pro 14')
  })

  test('GET /api/products/abc (non-numeric ID) should return 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/products/abc`)
    assert.strictEqual(res.status, 400)
    const data = await res.json()
    assert.ok(data.error.includes('ID inválido'))
  })

  test('GET /api/products/-5 (negative ID) should return 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/products/-5`)
    assert.strictEqual(res.status, 400)
    const data = await res.json()
    assert.ok(data.error.includes('ID inválido'))
  })

  test('GET /api/products/99999 (non-existent ID) should return 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/api/products/99999`)
    assert.strictEqual(res.status, 404)
    const data = await res.json()
    assert.strictEqual(data.error, 'Produto não encontrado')
  })

  // --- POST /api/products ---
  test('POST /api/products with valid payload should return 201 Created', async () => {
    const payload = {
      title: 'Headset Sony WH-1000XM5',
      description: 'Cancelamento de ruído líder de mercado com áudio de alta resolução',
      price: 2299.9,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    }

    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    assert.strictEqual(res.status, 201)
    const data = await res.json()
    assert.strictEqual(data.title, payload.title)
    assert.strictEqual(data.description, payload.description)
    assert.strictEqual(data.price, payload.price)
    assert.strictEqual(data.imageUrl, payload.imageUrl)
    assert.ok(data.id)
  })

  test('POST /api/products with invalid payload (short title, short desc, negative price) should return 400 with Zod issues', async () => {
    const invalidPayload = {
      title: 'AB',
      description: 'Curto',
      price: -10,
    }

    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    })

    assert.strictEqual(res.status, 400)
    const data = await res.json()
    assert.strictEqual(data.error, 'Dados inválidos no payload da requisição')
    assert.ok(Array.isArray(data.issues))
    assert.ok(data.issues.length >= 3) // title, description, price, imageUrl
  })

  // --- PUT /api/products/:id ---
  test('PUT /api/products/1 with valid partial payload should return 200 with updated product', async () => {
    const updatePayload = {
      title: 'MacBook Pro 14 M3 Pro',
      price: 17999.0,
    }

    const res = await fetch(`${baseUrl}/api/products/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    })

    assert.strictEqual(res.status, 200)
    const data = await res.json()
    assert.strictEqual(data.title, 'MacBook Pro 14 M3 Pro')
    assert.strictEqual(data.price, 17999.0)
  })

  test('PUT /api/products/1 with negative price should return 400 Bad Request (Zod validation)', async () => {
    const invalidPayload = {
      price: -50.0,
    }

    const res = await fetch(`${baseUrl}/api/products/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    })

    assert.strictEqual(res.status, 400)
    const data = await res.json()
    assert.strictEqual(data.error, 'Dados inválidos no payload da requisição')
    assert.ok(data.issues.some((issue: any) => issue.field === 'price'))
  })

  test('PUT /api/products/99999 with non-existent ID should return 404 Not Found (Prisma P2025)', async () => {
    const res = await fetch(`${baseUrl}/api/products/99999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Novo Título Válido' }),
    })

    assert.strictEqual(res.status, 404)
    const data = await res.json()
    assert.strictEqual(data.error, 'Produto não encontrado')
  })

  test('PUT /api/products/abc with invalid ID should return 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/products/abc`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Novo Título' }),
    })

    assert.strictEqual(res.status, 400)
    const data = await res.json()
    assert.ok(data.error.includes('ID inválido'))
  })

  // --- DELETE /api/products/:id ---
  test('DELETE /api/products/1 with valid ID should return 204 No Content', async () => {
    const res = await fetch(`${baseUrl}/api/products/1`, {
      method: 'DELETE',
    })

    assert.strictEqual(res.status, 204)
    const body = await res.text()
    assert.strictEqual(body, '')
  })

  test('DELETE /api/products/99999 with non-existent ID should return 404 Not Found (Prisma P2025)', async () => {
    const res = await fetch(`${baseUrl}/api/products/99999`, {
      method: 'DELETE',
    })

    assert.strictEqual(res.status, 404)
    const data = await res.json()
    assert.strictEqual(data.error, 'Produto não encontrado')
  })

  test('DELETE /api/products/abc with invalid ID should return 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/products/abc`, {
      method: 'DELETE',
    })

    assert.strictEqual(res.status, 400)
    const data = await res.json()
    assert.ok(data.error.includes('ID inválido'))
  })

  // --- Unknown route ---
  test('GET /unknown-route should return 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/unknown-route`)
    assert.strictEqual(res.status, 404)
    const data = await res.json()
    assert.strictEqual(data.error, 'Rota não encontrada')
  })
})
