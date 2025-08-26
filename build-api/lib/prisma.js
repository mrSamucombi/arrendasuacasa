// DENTRO DE lib/prisma.ts
import { PrismaClient } from '@prisma/client';
const prisma = global.prisma || new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Ativa logs detalhados do Prisma
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
export { prisma };
