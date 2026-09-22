import { Router, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { prisma } from '../lib/prisma'
import { createProductSchema, updateProductSchema } from '../schemas/product.schema'

export const productsRouter = Router()

// GET /api/products -> Listar todos os produtos
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
    })
    return res.status(200).json(products)
  } catch (error) {
    console.error('Erro ao listar produtos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/products/:id -> Buscar produto específico por ID
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const numericId = Number(id)

    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: 'ID inválido. Forneça um número inteiro positivo.' })
    }

    const product = await prisma.product.findUnique({
      where: { id: numericId },
    })

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    return res.status(200).json(product)
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// POST /api/products -> Criar um novo produto
productsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createProductSchema.parse(req.body)

    const product = await prisma.product.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        imageUrl: validatedData.imageUrl,
      },
    })

    return res.status(201).json(product)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos no payload da requisição',
        issues: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    console.error('Erro ao criar produto:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// PUT /api/products/:id -> Atualização parcial de um produto
productsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const numericId = Number(id)

    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: 'ID inválido. Forneça um número inteiro positivo.' })
    }

    const validatedData = updateProductSchema.parse(req.body)

    const updatedProduct = await prisma.product.update({
      where: { id: numericId },
      data: validatedData,
    })

    return res.status(200).json(updatedProduct)
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos no payload da requisição',
        issues: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    console.error('Erro ao atualizar produto:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// DELETE /api/products/:id -> Remover produto por ID
productsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const numericId = Number(id)

    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: 'ID inválido. Forneça um número inteiro positivo.' })
    }

    await prisma.product.delete({
      where: { id: numericId },
    })

    return res.status(204).send()
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    console.error('Erro ao deletar produto:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})
