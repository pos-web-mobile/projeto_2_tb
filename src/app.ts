import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from './swagger'
import { productsRouter } from './routes/products.routes'

export const app = express()

// Configuração do CORS
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (como Insomnia, Postman, cURL ou apps mobile)
      // e origens explicitamente configuradas no ALLOWED_ORIGIN ou curinga '*'
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true)
      } else {
        callback(new Error(`Bloqueado por CORS: Origem '${origin}' não autorizada.`))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Parser para corpo JSON
app.use(express.json())

// Documentação Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/docs', (req: Request, res: Response) => {
  res.redirect('/api-docs')
})

// GET / -> Status da API (Health Check)
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'API do Catálogo de Produtos operacional',
    docs: '/api-docs',
    endpoints: {
      products: '/api/products',
      docs: '/api-docs',
    },
    timestamp: new Date().toISOString(),
  })
})

// Rotas da entidade Products (acessível via /api/products e retrocompatível via /products)
app.use('/api/products', productsRouter)
app.use('/products', productsRouter)

// Middleware para rotas inexistentes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Middleware global de tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message && err.message.startsWith('Bloqueado por CORS')) {
    return res.status(403).json({ error: err.message })
  }

  console.error('Erro interno:', err)
  return res.status(500).json({ error: 'Erro interno do servidor' })
})
