export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Product Catalog API',
    version: '1.0.0',
    description: 'Documentação interativa da API RESTful do Catálogo de Produtos desenvolvida em Node.js, TypeScript, Express, PostgreSQL e Prisma.',
    contact: {
      name: 'Gabriel Barros'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local'
    }
  ],
  tags: [
    {
      name: 'Status',
      description: 'Verificação de integridade da API'
    },
    {
      name: 'Produtos',
      description: 'Operações de consulta do catálogo de produtos'
    }
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
                    status: {
                      type: 'string',
                      example: 'ok'
                    },
                    message: {
                      type: 'string',
                      example: 'API do Catálogo de Produtos operacional'
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                      example: '2026-09-08T01:31:26.888Z'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/products': {
      get: {
        tags: ['Produtos'],
        summary: 'Listar todos os produtos',
        description: 'Retorna todos os produtos cadastrados no banco de dados ordenados por ID.',
        responses: {
          '200': {
            description: 'Lista de produtos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            }
          },
          '500': {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Produtos'],
        summary: 'Buscar produto por ID',
        description: 'Retorna os detalhes de um produto específico através do seu identificador numérico.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador numérico do produto',
            schema: {
              type: 'integer',
              example: 1
            }
          }
        ],
        responses: {
          '200': {
            description: 'Produto encontrado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product'
                }
              }
            }
          },
          '400': {
            description: 'Identificador do produto inválido',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                  error: 'ID inválido. Forneça um número inteiro positivo.'
                }
              }
            }
          },
          '404': {
            description: 'Produto não encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                },
                example: {
                  error: 'Produto não encontrado'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          title: {
            type: 'string',
            example: 'MacBook Pro 14'
          },
          description: {
            type: 'string',
            example: 'Chip Apple M2 Pro, 16GB de memória unificada, 512GB SSD, Tela Liquid Retina XDR de 14.2 polegadas'
          },
          price: {
            type: 'string',
            example: '15999.00'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-08T01:12:06.781Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-08T01:12:06.781Z'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Produto não encontrado'
          }
        }
      }
    }
  }
}
