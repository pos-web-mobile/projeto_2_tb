# API de Catálogo de Produtos

API RESTful desenvolvida em **Node.js** com **TypeScript** e **Express**, persistindo dados em **PostgreSQL** através do **Prisma ORM**, com suporte a containerização via **Docker Compose** e coleção de testes para **Insomnia**.

---

## 🎯 Tecnologias Utilizadas

- **Runtime & Linguagem**: Node.js + TypeScript
- **Framework Web**: Express.js com middleware CORS e parser JSON
- **Banco de Dados**: PostgreSQL 15 (Alpine)
- **Containerização**: Docker & Docker Compose
- **ORM**: Prisma (Modelagem, Migrations, Seed e Studio)
- **Execução & Tooling**: TSX, Dotenv
- **Documentação Interativa**: Swagger UI (`swagger-ui-express`) disponível em `/api-docs`

---

## 📁 Estrutura do Projeto

```text
.
├── conductor/                 # Governança e histórico do projeto (SDD)
├── prisma/
│   ├── migrations/            # Migrações versionadas do banco de dados
│   ├── schema.prisma          # Definição do modelo Product e conexão
│   └── seed.ts                # Script de povoamento com dados reais
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Instância compartilhada do Prisma Client
│   ├── app.ts                 # Configuração de rotas, middlewares e erros
│   ├── server.ts              # Inicialização do servidor HTTP Express
│   └── swagger.ts             # Especificação OpenAPI 3.0 para Swagger UI
├── tests/
│   └── api.test.ts            # Testes automatizados de integração dos endpoints
├── docker-compose.yml         # Orquestração do PostgreSQL 15 em container
├── .env.example               # Modelo de variáveis de ambiente
├── package.json               # Dependências e scripts npm
└── tsconfig.json              # Configurações do compilador TypeScript
```

---

## ⚙️ Configuração e Instalação

### 1. Clonar repositório e instalar dependências

```bash
git clone https://github.com/pos-web-mobile/projeto_1_tb.git
cd projeto_1_tb
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Conteúdo padrão do `.env`:
```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/catalog_db?schema=public"
PORT=3000
```

> **Nota para execução local**: Se estiver rodando sem Docker em porta local customizada (ex: 5433), configure a `DATABASE_URL` para a porta correspondente.

---

## 🐳 Executando com Docker Compose

Suba o container do PostgreSQL 15 com persistência de volume:

```bash
docker compose up -d
```

Para verificar o status do container:
```bash
docker compose ps
```

Para encerrar o container preservando os dados:
```bash
docker compose down
```

---

## 🔄 Migrations & Seed (Prisma)

### Executar migrações

Cria e aplica a tabela `products` no banco PostgreSQL:

```bash
npm run prisma:migrate
```

### Popular banco de dados (Seed)

Insere 5 produtos reais no banco (MacBook Pro 14, iPhone 15 Pro, Monitor Dell UltraSharp, Teclado Keychron K2, Mouse Logitech MX Master 3S):

```bash
npm run seed
```

### Prisma Studio (Interface Web para o Banco)

Abra a interface visual do Prisma para inspecionar os registros da tabela `products`:

```bash
npm run prisma:studio
```
Acesse em: `http://localhost:5555`

---

## 🚀 Executando a API

### Modo Desenvolvimento (Hot Reload)

```bash
npm run dev
```
O servidor estará acessível em: `http://localhost:3000`

### Modo Produção

```bash
npm run build
npm start
```

---

## 📚 Documentação Interativa com Swagger

A API disponibiliza a interface interativa do **Swagger UI** (OpenAPI 3.0) para visualização dos modelos, rotas e teste direto das requisições pelo navegador:

- **URL do Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Atalho**: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 📡 Endpoints da API REST

| Método | Endpoint | Descrição | Status Sucesso | Status Erro |
| :--- | :--- | :--- | :---: | :---: |
| **GET** | `/` | Health check / Status da API | `200 OK` | - |
| **GET** | `/products` | Lista todos os produtos cadastrados | `200 OK` | `500` |
| **GET** | `/products/:id` | Busca produto por ID numérico | `200 OK` | `400` / `404` |

### Exemplos de Resposta

#### 1. `GET /`
```json
{
  "status": "ok",
  "message": "API do Catálogo de Produtos operacional",
  "timestamp": "2026-09-08T01:31:26.888Z"
}
```

#### 2. `GET /products`
```json
[
  {
    "id": 1,
    "title": "MacBook Pro 14",
    "description": "Chip Apple M2 Pro, 16GB de memória unificada, 512GB SSD, Tela Liquid Retina XDR de 14.2 polegadas",
    "price": "15999",
    "createdAt": "2026-09-08T01:12:06.781Z",
    "updatedAt": "2026-09-08T01:12:06.781Z"
  }
]
```

#### 3. `GET /products/1`
```json
{
  "id": 1,
  "title": "MacBook Pro 14",
  "description": "Chip Apple M2 Pro, 16GB de memória unificada, 512GB SSD, Tela Liquid Retina XDR de 14.2 polegadas",
  "price": "15999",
  "createdAt": "2026-09-08T01:12:06.781Z",
  "updatedAt": "2026-09-08T01:12:06.781Z"
}
```

#### 4. `GET /products/99999` (404 Not Found)
```json
{
  "error": "Produto não encontrado"
}
```

#### 5. `GET /products/abc` (400 Bad Request)
```json
{
  "error": "ID inválido. Forneça um número inteiro positivo."
}
```