export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Product Catalog API',
    version: '2.0.0',
    description:
      'Documentação interativa da API RESTful do Catálogo de Produtos com CRUD completo, desenvolvida em Node.js, TypeScript, Express, PostgreSQL, Prisma e Zod.',
    contact: {
      name: 'Gabriel Barros',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local',
    },
  ],
  tags: [
    {
      name: 'Status',
      description: 'Verificação de integridade da API',
    },
    {
      name: 'Produtos',
      description: 'Operações completas de CRUD do catálogo de produtos',
    },
  ],
  paths: {
    '/': {
      get: {
        tags: ['Status'],
        summary: 'Verifica o status da API',
        description: 'Retorna confirmação de que a API está ativa e o timestamp atual.',
        responses: {
          '200': {
            description: 'API operacional',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    message: { type: 'string', example: 'API do Catálogo de Produtos operacional' },
                    docs: { type: 'string', example: '/api-docs' },
                    endpoints: {
                      type: 'object',
                      properties: {
                        products: { type: 'string', example: '/api/products' },
                        docs: { type: 'string', example: '/api-docs' },
                      },
                    },
                    timestamp: { type: 'string', format: 'date-time', example: '2026-09-20T18:00:00.000Z' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Produtos'],
        summary: 'Listar todos os produtos',
        description: 'Retorna todos os produtos cadastrados no banco de dados ordenados por ID crescente.',
        responses: {
          '200': {
            description: 'Lista de produtos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Produtos'],
        summary: 'Criar um novo produto',
        description: 'Cadastra um novo produto no banco com validação em runtime via Zod.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProductInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Produto criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '400': {
            description: 'Payload inválido ou falha de validação Zod',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Produtos'],
        summary: 'Buscar produto por ID',
        description: 'Retorna os detalhes de um produto específico através do seu identificador numérico.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador numérico do produto (inteiro positivo)',
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'Produto encontrado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '400': {
            description: 'ID inválido (não numérico ou menor/igual a zero)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'ID inválido. Forneça um número inteiro positivo.' },
              },
            },
          },
          '404': {
            description: 'Produto não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Produto não encontrado' },
              },
            },
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Produtos'],
        summary: 'Atualização parcial do produto por ID',
        description: 'Atualiza um ou mais campos do produto existente. Utiliza schema parcial (.partial()) do Zod.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador numérico do produto a ser atualizado',
            schema: { type: 'integer', example: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProductInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Produto atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '400': {
            description: 'ID inválido ou dados do payload inválidos (ex: preço negativo)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Produto não encontrado (erro Prisma P2025)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Produto não encontrado' },
              },
            },
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Produtos'],
        summary: 'Deletar produto por ID',
        description: 'Remove o produto especificado do banco de dados.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador numérico do produto a ser deletado',
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          '204': {
            description: 'Produto removido com sucesso (Sem conteúdo)',
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'ID inválido. Forneça um número inteiro positivo.' },
              },
            },
          },
          '404': {
            description: 'Produto não encontrado (erro Prisma P2025)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Produto não encontrado' },
              },
            },
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'MacBook Pro 14' },
          description: {
            type: 'string',
            example: 'Chip Apple M2 Pro, 16GB de memória unificada, 512GB SSD, Tela Liquid Retina XDR de 14.2 polegadas',
          },
          price: { type: 'string', example: '15999.00' },
          imageUrl: {
            type: 'string',
            example: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
          },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-08T01:12:06.781Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-09-08T01:12:06.781Z' },
        },
      },
      CreateProductInput: {
        type: 'object',
        required: ['title', 'description', 'price', 'imageUrl'],
        properties: {
          title: { type: 'string', minLength: 3, example: 'MacBook Pro 14' },
          description: {
            type: 'string',
            minLength: 10,
            example: 'Chip Apple M2 Pro, 16GB de memória unificada, 512GB SSD, Tela Liquid Retina XDR de 14.2 polegadas',
          },
          price: { type: 'number', minimum: 0.01, example: 15999.00 },
          imageUrl: {
            type: 'string',
            minLength: 1,
            example: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
          },
        },
      },
      UpdateProductInput: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3, example: 'MacBook Pro 14 M3 Max' },
          description: {
            type: 'string',
            minLength: 10,
            example: 'Versão atualizada com processador M3 Max e 36GB de RAM.',
          },
          price: { type: 'number', minimum: 0.01, example: 18999.00 },
          imageUrl: {
            type: 'string',
            minLength: 1,
            example: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Produto não encontrado' },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Dados inválidos no payload da requisição' },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'price' },
                message: { type: 'string', example: 'O preço deve ser um valor positivo maior que zero' },
              },
            },
          },
        },
      },
    },
  },
}
