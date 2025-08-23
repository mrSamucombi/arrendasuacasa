// DENTRO DE prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('A iniciar o processo de seeding...');

  // Limpar dados antigos para executar o seed várias vezes sem erros
  await prisma.coinPackage.deleteMany({});
  console.log('Pacotes de moedas antigos eliminados.');

  await prisma.coinPackage.createMany({
    data: [
      { id: "pkg-1", description: "Pacote Inicial", coins: 50, price: 5000 },
      { id: "pkg-2", description: "Mais Popular", coins: 120, price: 10000 },
      { id: "pkg-3", description: "Melhor Valor", coins: 300, price: 22500 }
    ],
  });
  console.log('Novos pacotes de moedas criados com sucesso.');

  console.log('Seeding concluído.');
}

main()
  .catch(e => {
    console.error("Erro durante o seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });