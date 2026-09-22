# API de Catálogo de Produtos – CRUD com Express, Prisma e Zod

[![Vídeo de Apresentação](https://img.youtube.com/vi/pkbx1c8xc-s/maxresdefault.jpg)](https://youtu.be/pkbx1c8xc-s)

> 🎬 **Vídeo de Apresentação**: [Assista à demonstração completa no YouTube](https://youtu.be/pkbx1c8xc-s)

API RESTful desenvolvida em **Node.js** com **TypeScript** e **Express**, utilizando **Prisma ORM** para persistência no **PostgreSQL**, validação de schemas em tempo de execução com **Zod**, suporte a containerização via **Docker Compose**, documentação interativa com **Swagger UI** e workspace completo para testes no **Insomnia**.

---

## 🎯 Objetivo do Projeto

Implementar e disponibilizar um CRUD completo e robusto para a entidade `Product`, com:
- Validação em runtime de payloads de entrada via **Zod** (`createProductSchema` e `updateProductSchema.partial()`).
- Mapeamento e tratamento adequado de status codes HTTP (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found` tratando o código `P2025` do Prisma, e `500 Internal Server Error`).
- Configuração e política explícita de **CORS** para consumo pelo front-end (ex.: React/Vite em `http://localhost:5173`).
- Persistência em banco relacional PostgreSQL através de containers **Docker**.
- Povoamento idempotente de dados iniciais (**Seed** com 5 produtos reais).
- Documentação interativa via **Swagger UI** e suíte de testes manuais no **Insomnia** e automatizados com `node:test`.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime & Linguagem**: Node.js (v18+) + TypeScript
- **Framework Web**: Express.js (com middlewares `cors` e `express.json`)
- **Validação em Tempo de Execução**: Zod
- **ORM & Banco de Dados**: Prisma ORM + PostgreSQL 15 (Alpine)
- **Containerização**: Docker & Docker Compose
- **Documentação Interativa**: Swagger UI (`swagger-ui-express`)
- **Ferramentas de Teste**: Insomnia (Coleção v4 exportada) e Node Test Runner (`tsx --test`)

---

## 📁 Estrutura do Projeto

```text
.
├── prisma/
│   ├── migrations/            # Histórico de migrações do banco de dados
│   ├── schema.prisma          # Modelo Product e configuração da fonte de dados
│   └── seed.ts                # Script para popular o banco com registros iniciais
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Instância compartilhada do Prisma Client
│   ├── routes/
│   │   └── products.routes.ts # Rotas e controladores do CRUD de produtos
│   ├── schemas/
│   │   └── product.schema.ts  # Schemas de validação Zod (Create e Update)
│   ├── app.ts                 # Configuração do Express, CORS e tratamento global de erros
│   ├── server.ts              # Inicialização do servidor HTTP
│   └── swagger.ts             # Especificação OpenAPI 3.0 para o Swagger UI
├── tests/
│   └── api.test.ts            # Testes automatizados cobrindo todos os cenários da API
├── docker-compose.yml         # Orquestração do PostgreSQL em container Docker
├── insomnia_collection.json   # Coleção pronta para importação no Insomnia
├── .env.example               # Modelo documentado das variáveis de ambiente
├── package.json               # Dependências e scripts do projeto
└── tsconfig.json              # Configuração do compilador TypeScript
```

---

## 🔒 Política de CORS Adotada e Justificativa

A API utiliza o middleware `cors` configurado em `src/app.ts` com as seguintes diretrizes:

1. **Origens Permitidas (`origin`)**:
   - Restrito por padrão à origem do front-end: `http://localhost:5173` (porta padrão do Vite/React).
   - Configurável dinamicamente através da variável de ambiente `ALLOWED_ORIGIN` no `.env` (suporta origens únicas ou separadas por vírgula).
   - Requisições que não enviam cabeçalho `Origin` (como clientes de teste de API: Insomnia, Postman, cURL ou aplicações móveis nativas) são permitidas para viabilizar testes locais e integração servidor-a-servidor sem comprometer a segurança do navegador.
   - Caso uma origem não autorizada tente efetuar uma requisição a partir do navegador, o CORS rejeita a conexão e a API retorna status `403 Forbidden`.

2. **Métodos HTTP Permitidos (`methods`)**:
   - `GET, POST, PUT, DELETE, OPTIONS`
   - *Justificativa*: Cobre todas as operações necessárias para o ciclo de vida completo do CRUD e o handshake preliminar de preflight (`OPTIONS`) exigido pelos navegadores para requisições com corpo JSON ou métodos não simples (PUT, DELETE).

3. **Cabeçalhos Permitidos (`allowedHeaders`)**:
   - `Content-Type, Authorization`
   - *Justificativa*: `Content-Type` é indispensável para o envio de dados estruturados em JSON (`application/json`) em requisições `POST` e `PUT`. `Authorization` é reservado para permitir autenticação via Bearer Tokens em futuras integrações com o front-end.

4. **Envio de Credenciais (`credentials: true`)**:
   - Permite que o front-end trafegue cookies de sessão ou cabeçalhos de autenticação de forma segura entre origens cruzadas.

---

## ⚙️ Passo a Passo de Instalação e Execução

### 1. Clonar o repositório e instalar as dependências

```bash
git clone https://github.com/gabrielbarros/projeto_2_tb.git
cd projeto_2_tb
npm install
```

### 2. Configurar as variáveis de ambiente

Copie o arquivo de exemplo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Conteúdo padrão do arquivo `.env`:
```env
# Conexão com o PostgreSQL no Docker Compose (porta padrão 5432)
DATABASE_URL="postgresql://admin:password123@localhost:5432/catalog_db?schema=public"

# Porta onde o servidor Express responderá
PORT=3000

# Origem autorizada no CORS (Front-end Vite/React)
ALLOWED_ORIGIN="http://localhost:5173"
```

> **Nota**: Se você já tiver um serviço PostgreSQL nativo rodando na porta 5432 do seu host e preferir mapear o Docker para outra porta (ex: 5433), altere o mapeamento no `docker-compose.yml` (`"5433:5432"`) e ajuste a `DATABASE_URL` no `.env` para apontar para a porta 5433.

### 3. Subir o banco de dados com Docker Compose

Inicie o container do PostgreSQL em segundo plano:

```bash
docker compose up -d
```

Para verificar se o container está saudável e em execução:
```bash
docker compose ps
```

### 4. Executar as Migrações e o Seed do Prisma

Gere o cliente do Prisma e aplique a estrutura da tabela `products`:

```bash
npm run prisma:migrate
```

Popule o banco com os 5 produtos iniciais:

```bash
npm run seed
```

*(Opcional)* Para visualizar os dados através de uma interface web gráfica:
```bash
npm run prisma:studio
```
Acesse: [http://localhost:5555](http://localhost:5555)

### 5. Iniciar a API

#### Modo Desenvolvimento (com hot-reload):
```bash
npm run dev
```

#### Modo Produção:
```bash
npm run build
npm start
```

O servidor estará ouvindo em: `http://localhost:3000`

---

## 📚 Documentação Interativa com Swagger UI

A API conta com documentação interativa em formato OpenAPI 3.0:

- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Atalho**: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 📡 Endpoints da API REST

A API disponibiliza os endpoints sob o prefixo `/api/products` (com alias em `/products` para compatibilidade retroativa):

| Método | Endpoint | Descrição | Status Sucesso | Status Erro |
| :--- | :--- | :--- | :---: | :---: |
| **GET** | `/` | Health check da API | `200 OK` | - |
| **GET** | `/api/products` | Lista todos os produtos cadastrados | `200 OK` | `500` |
| **GET** | `/api/products/:id` | Busca produto por ID numérico | `200 OK` | `400`, `404`, `500` |
| **POST** | `/api/products` | Cria um novo produto (Validação Zod) | `201 Created` | `400`, `500` |
| **PUT** | `/api/products/:id` | Atualização parcial (Schema `.partial()`) | `200 OK` | `400`, `404`, `500` |
| **DELETE** | `/api/products/:id` | Remove o produto por ID | `204 No Content` | `400`, `404`, `500` |

---

## 🛡️ Validação com Zod e Tratamento de Erros

### Regras de Validação em Runtime (`product.schema.ts`)

- `title`: `string().trim().min(3, "O título deve ter no mínimo 3 caracteres")`
- `description`: `string().trim().min(10, "A descrição deve ter no mínimo 10 caracteres")`
- `price`: `number().positive("O preço deve ser um valor positivo maior que zero")`
- `imageUrl`: `string().trim().min(1, "A URL da imagem é obrigatória")`

O schema de atualização utiliza:
```typescript
export const updateProductSchema = createProductSchema.partial()
```
Isso permite que qualquer combinação de campos válidos seja enviada para atualização parcial.

### Mapeamento de Status Codes e Tratamento de Exceções

1. **`200 OK`**: Retornado em consultas bem-sucedidas (`GET /api/products`, `GET /api/products/:id`) e em atualizações com sucesso (`PUT /api/products/:id`).
2. **`201 Created`**: Retornado na criação de um produto (`POST /api/products`) com o registro criado e ID gerado.
3. **`204 No Content`**: Retornado na exclusão bem-sucedida (`DELETE /api/products/:id`), sem corpo de resposta.
4. **`400 Bad Request`**:
   - **ID inválido**: Quando o parâmetro `:id` não for numérico ou for `<= 0` (ex: `/api/products/abc` ou `/api/products/-1`).
   - **ZodError**: Quando o payload enviado não cumprir os requisitos de validação (ex: título curto, preço negativo, campos ausentes).
5. **`404 Not Found`**:
   - Quando um ID numérico válido não existe no banco de dados durante `GET`.
   - Quando uma operação `PUT` ou `DELETE` tenta modificar/deletar um registro inexistente, capturando o erro específico `P2025` (`PrismaClientKnownRequestError`).
6. **`500 Internal Server Error`**:
   - Falhas inesperadas de infraestrutura ou banco de dados, tratadas pelo middleware global sem vazar detalhes internos sensíveis.

---

## 🧪 Exemplos de Requisições e Payloads

### 1. Criar Produto Válido (`POST /api/products`)
**Requisição:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Headset Sony WH-1000XM5",
    "description": "Cancelamento de ruído líder da indústria com processador integrado V1 e 8 microfones",
    "price": 2299.90,
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  }'
```
**Resposta (`201 Created`):**
```json
{
  "id": 6,
  "title": "Headset Sony WH-1000XM5",
  "description": "Cancelamento de ruído líder da indústria com processador integrado V1 e 8 microfones",
  "price": "2299.9",
  "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "createdAt": "2026-09-20T21:00:00.000Z",
  "updatedAt": "2026-09-20T21:00:00.000Z"
}
```

### 2. Criar Produto com Payload Inválido (`POST /api/products`)
**Requisição:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AB",
    "description": "Curto",
    "price": -50.00
  }'
```
**Resposta (`400 Bad Request`):**
```json
{
  "error": "Dados inválidos no payload da requisição",
  "issues": [
    { "field": "title", "message": "O título deve ter no mínimo 3 caracteres" },
    { "field": "description", "message": "A descrição deve ter no mínimo 10 caracteres" },
    { "field": "price", "message": "O preço deve ser um valor positivo maior que zero" },
    { "field": "imageUrl", "message": "A URL da imagem é obrigatória" }
  ]
}
```

### 3. Atualização Parcial Válida (`PUT /api/products/1`)
**Requisição:**
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MacBook Pro 14 M3 Pro",
    "price": 16999.00
  }'
```
**Resposta (`200 OK`):**
```json
{
  "id": 1,
  "title": "MacBook Pro 14 M3 Pro",
  "description": "Chip Apple M2 Pro, 16GB de memória unificada, 512GB SSD, Tela Liquid Retina XDR de 14.2 polegadas",
  "price": "16999",
  "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  "createdAt": "2026-09-20T18:00:00.000Z",
  "updatedAt": "2026-09-20T21:05:00.000Z"
}
```

### 4. Atualização com Preço Negativo (`PUT /api/products/1`)
**Requisição:**
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{ "price": -200.00 }'
```
**Resposta (`400 Bad Request`):**
```json
{
  "error": "Dados inválidos no payload da requisição",
  "issues": [
    { "field": "price", "message": "O preço deve ser um valor positivo maior que zero" }
  ]
}
```

### 5. Atualização de ID Inexistente (`PUT /api/products/99999`)
**Requisição:**
```bash
curl -X PUT http://localhost:3000/api/products/99999 \
  -H "Content-Type: application/json" \
  -d '{ "title": "Inexistente" }'
```
**Resposta (`404 Not Found`):**
```json
{
  "error": "Produto não encontrado"
}
```

### 6. Deletar Produto Existente (`DELETE /api/products/1`)
**Requisição:**
```bash
curl -X DELETE http://localhost:3000/api/products/1
```
**Resposta (`204 No Content`)**: Sem corpo na resposta.

### 7. Deletar Produto Inexistente (`DELETE /api/products/99999`)
**Requisição:**
```bash
curl -X DELETE http://localhost:3000/api/products/99999
```
**Resposta (`404 Not Found`):**
```json
{
  "error": "Produto não encontrado"
}
```

---

## 📬 Testes no Insomnia

O repositório inclui o arquivo [`insomnia_collection.json`](./insomnia_collection.json) pronto para importação.

### Como importar no Insomnia:
1. Abra o Insomnia.
2. Clique em **Preferences** (ou no menu superior esquerdo) → **Data** → **Import Data** → **From File**.
3. Selecione o arquivo `insomnia_collection.json` na raiz deste projeto.
4. Será criado o Workspace **"Catálogo de Produtos - CRUD Express Prisma Zod"**.

### Requisições configuradas e Status Codes Esperados:

| # | Pasta | Nome da Requisição | Método | URL | Status Esperado | Notas / Objetivo |
|---|---|---|:---:|---|:---:|---|
| 1 | Produtos | `1. GET /api/products - Listar todos` | `GET` | `{{ _.base_url }}/api/products` | `200 OK` | Lista todos os produtos cadastrados |
| 2 | Produtos | `2. GET /api/products/:id - Válido` | `GET` | `{{ _.base_url }}/api/products/1` | `200 OK` | Busca produto com ID 1 existente |
| 3 | Produtos | `3. GET /api/products/:id - ID Inválido (400)` | `GET` | `{{ _.base_url }}/api/products/abc` | `400 Bad Request` | Parâmetro não numérico |
| 4 | Produtos | `4. GET /api/products/:id - Inexistente (404)` | `GET` | `{{ _.base_url }}/api/products/99999` | `404 Not Found` | ID numérico que não existe |
| 5 | Produtos | `5. POST /api/products - Payload Válido (201)` | `POST` | `{{ _.base_url }}/api/products` | `201 Created` | Cria produto atendendo regras do Zod |
| 6 | Produtos | `6. POST /api/products - Payload Inválido (400)` | `POST` | `{{ _.base_url }}/api/products` | `400 Bad Request` | Violação de regras do Zod |
| 7 | Produtos | `7. PUT /api/products/:id - Atualização Parcial Válida (200)` | `PUT` | `{{ _.base_url }}/api/products/1` | `200 OK` | Atualização com schema `.partial()` |
| 8 | Produtos | `8. PUT /api/products/:id - Preço Negativo (400)` | `PUT` | `{{ _.base_url }}/api/products/1` | `400 Bad Request` | Zod rejeita preço negativo |
| 9 | Produtos | `9. PUT /api/products/:id - ID Inexistente (404 Prisma P2025)` | `PUT` | `{{ _.base_url }}/api/products/99999` | `404 Not Found` | Captura erro P2025 do Prisma |
| 10 | Produtos | `10. DELETE /api/products/:id - Válido (204)` | `DELETE` | `{{ _.base_url }}/api/products/1` | `204 No Content` | Remove produto sem conteúdo de retorno |
| 11 | Produtos | `11. DELETE /api/products/:id - Inexistente (404 Prisma P2025)` | `DELETE` | `{{ _.base_url }}/api/products/99999` | `404 Not Found` | Captura erro P2025 do Prisma |
| 12 | Geral | `12. GET / - Health Check (200)` | `GET` | `{{ _.base_url }}/` | `200 OK` | Retorna status operacional da API |

---

## 🧪 Executando os Testes Automatizados

O projeto inclui uma suíte completa de 17 testes automatizados cobrindo todos os endpoints, validações Zod e tratamento de erros do Prisma:

```bash
npm test
```

Saída esperada:
```text
✔ Product Catalog API Test Suite (CRUD + Zod + Prisma P2025)
  ✔ GET / should return 200 with status ok and endpoints info
  ✔ GET /api-docs should return 200 serving Swagger UI
  ✔ GET /api/products should return 200 and array of products
  ✔ GET /api/products/1 should return 200 with matching product
  ✔ GET /api/products/abc (non-numeric ID) should return 400 Bad Request
  ✔ GET /api/products/-5 (negative ID) should return 400 Bad Request
  ✔ GET /api/products/99999 (non-existent ID) should return 404 Not Found
  ✔ POST /api/products with valid payload should return 201 Created
  ✔ POST /api/products with invalid payload (short title, short desc, negative price) should return 400 with Zod issues
  ✔ PUT /api/products/1 with valid partial payload should return 200 with updated product
  ✔ PUT /api/products/1 with negative price should return 400 Bad Request (Zod validation)
  ✔ PUT /api/products/99999 with non-existent ID should return 404 Not Found (Prisma P2025)
  ✔ PUT /api/products/abc with invalid ID should return 400 Bad Request
  ✔ DELETE /api/products/1 with valid ID should return 204 No Content
  ✔ DELETE /api/products/99999 with non-existent ID should return 404 Not Found (Prisma P2025)
  ✔ DELETE /api/products/abc with invalid ID should return 400 Bad Request
  ✔ GET /unknown-route should return 404 Not Found
```

---

## 📜 Licença

Este projeto está licenciado sob a licença **ISC**. Desenvolvido por **Gabriel Barros**.