import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { prisma } from './lib/prisma'
import { swaggerDocument } from './swagger'

export const app = express()

app.use(express.json())
app.use(cors())

// Documentação Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/docs', (req: Request, res: Response) => {
  res.redirect('/api-docs')
})

// GET / -> Status da API
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'API do Catálogo de Produtos operacional',
    docs: '/api-docs',
    timestamp: new Date().toISOString()
  })
})

// GET /products -> Listar todos os produtos
app.get('/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' }
    })
    res.json(products)
  } catch (error) {
    next(error)
  }
})

// GET /products/:id -> Buscar produto específico por ID
app.get('/products/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const numericId = Number(id)

    if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: 'ID inválido. Forneça um número inteiro positivo.' })
    }

    const product = await prisma.product.findUnique({
      where: { id: numericId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
})

// Middleware para rotas inexistentes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Middleware global de tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro interno:', err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})
