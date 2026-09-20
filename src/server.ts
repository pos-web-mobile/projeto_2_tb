import 'dotenv/config'
import { app } from './app'

const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  console.log(`📚 Swagger UI disponível em http://localhost:${PORT}/api-docs`)
  console.log(`📡 Endpoints disponíveis:`)
  console.log(`   - GET http://localhost:${PORT}/`)
  console.log(`   - GET http://localhost:${PORT}/products`)
  console.log(`   - GET http://localhost:${PORT}/products/:id`)
})