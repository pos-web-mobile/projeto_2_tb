import 'dotenv/config'
import { app } from './app'

const PORT = Number(process.env.PORT) || 3000
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173'

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  console.log(`🔒 CORS configurado para: ${ALLOWED_ORIGIN}`)
  console.log(`📚 Swagger UI disponível em http://localhost:${PORT}/api-docs`)
  console.log(`📡 Endpoints disponíveis:`)
  console.log(`   - GET    http://localhost:${PORT}/`)
  console.log(`   - GET    http://localhost:${PORT}/api/products`)
  console.log(`   - GET    http://localhost:${PORT}/api/products/:id`)
  console.log(`   - POST   http://localhost:${PORT}/api/products`)
  console.log(`   - PUT    http://localhost:${PORT}/api/products/:id`)
  console.log(`   - DELETE http://localhost:${PORT}/api/products/:id`)
})