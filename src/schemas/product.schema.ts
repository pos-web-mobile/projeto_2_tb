import { z } from 'zod'

export const createProductSchema = z.object({
  title: z
    .string({
      error: (issue) => (issue.input === undefined ? 'O título é obrigatório' : 'O título deve ser uma string'),
    })
    .trim()
    .min(3, 'O título deve ter no mínimo 3 caracteres'),
  description: z
    .string({
      error: (issue) => (issue.input === undefined ? 'A descrição é obrigatória' : 'A descrição deve ser uma string'),
    })
    .trim()
    .min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  price: z
    .number({
      error: (issue) => (issue.input === undefined ? 'O preço é obrigatório' : 'O preço deve ser um número'),
    })
    .positive('O preço deve ser um valor positivo maior que zero'),
  imageUrl: z
    .string({
      error: (issue) => (issue.input === undefined ? 'A URL da imagem é obrigatória' : 'A URL da imagem deve ser uma string'),
    })
    .trim()
    .min(1, 'A URL da imagem é obrigatória'),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
