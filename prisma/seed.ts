import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de produtos...')

  // Limpa registros anteriores para garantir idempotência do seed
  await prisma.product.deleteMany()

  const products = [
    {
      title: 'MacBook Pro 14',
      description: 'Chip Apple M2 Pro, 16GB de memória unificada, 512GB SSD, Tela Liquid Retina XDR de 14.2 polegadas',
      price: 15999.00,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'iPhone 15 Pro',
      description: 'Design em titânio aeroespacial, chip A17 Pro, câmera grande-angular de 48 MP e conexão USB-C',
      price: 7299.00,
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Monitor Dell UltraSharp U2723QE',
      description: '27 polegadas 4K UHD, tecnologia IPS Black, hub USB-C com 90W power delivery e cobertura 98% DCI-P3',
      price: 3450.00,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Teclado Keychron K2 Wireless',
      description: 'Teclado mecânico compacto 75%, switches Gateron G Pro Brown, iluminação RGB e conectividade Bluetooth 5.1',
      price: 650.00,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Mouse Logitech MX Master 3S',
      description: 'Mouse ergonômico com sensor de 8.000 DPI para qualquer superfície, cliques silenciosos e rolagem MagSpeed',
      price: 590.00,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    },
  ]

  for (const product of products) {
    const created = await prisma.product.create({ data: product })
    console.log(`✓ Produto inserido: [ID ${created.id}] ${created.title} - R$ ${created.price}`)
  }

  console.log(`Seed finalizado com sucesso! Total de ${products.length} produtos inseridos.`)
}

main()
  .catch((e) => {
    console.error('Erro durante a execução do seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })