// DENTRO DE lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Este padrão previne que múltiplas instâncias do PrismaClient sejam criadas
// em ambientes de desenvolvimento com "hot reloading".

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Ativa logs detalhados do Prisma
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };