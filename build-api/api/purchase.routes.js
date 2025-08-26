import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js'; // Assumindo que você tem checkRole
import { initiatePurchaseSchema } from '../lib/schemas.js';
import { z } from 'zod';
import { PurchaseStatus, UserRole } from '@prisma/client';
const router = Router();
// --- ROTAS DO UTILIZADOR ---
// ROTA GET: Obter o histórico de compras do utilizador logado
router.get('/', checkAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    const userId = req.user.uid;
    try {
        // Primeiro, tentamos encontrar um registro de 'Owner' com o ID do usuário.
        const ownerProfile = await prisma.owner.findUnique({
            where: { id: userId },
        });
        // Se encontrarmos um perfil de proprietário, significa que o usuário é um OWNER.
        if (ownerProfile) {
            // Agora podemos fazer a query com segurança.
            const purchases = await prisma.purchase.findMany({
                where: { ownerId: userId },
                orderBy: { createdAt: 'desc' },
                include: { pkg: true },
            });
            return res.status(200).json(purchases);
        }
        else {
            // Se não encontrarmos um perfil de proprietário, o usuário é um Cliente
            // ou um Admin. Em ambos os casos, eles não têm compras de moedas.
            // Retornamos um array vazio para que o frontend não quebre.
            return res.status(200).json([]);
        }
    }
    catch (error) {
        console.error("ERRO CRÍTICO ao buscar o histórico de compras:", error);
        res.status(500).json({ error: 'Falha ao obter o histórico de compras.' });
    }
});
// ROTA POST: Iniciar uma nova compra (Proprietário)
router.post('/', checkAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Não autorizado' });
    const ownerId = req.user.uid;
    try {
        const validatedData = initiatePurchaseSchema.parse(req.body);
        const newPurchase = await prisma.purchase.create({
            data: {
                ownerId: ownerId,
                pkgId: validatedData.pkgId,
                proofOfPaymentUrl: validatedData.proofOfPaymentUrl, // <-- CORRIGIDO
                status: PurchaseStatus.PENDING,
            },
            include: { pkg: true },
        });
        res.status(201).json(newPurchase);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "Dados inválidos.", details: error.flatten().fieldErrors });
        }
        console.error("ERRO ao criar a compra:", error);
        res.status(500).json({ error: 'Falha ao processar a sua compra.' });
    }
});
// --- ROTAS DO ADMINISTRADOR ---
// ROTA GET /admin: Obter todas as compras pendentes
// Requer autenticação e permissão de Administrador
router.get('/admin', checkAuth, checkRole(UserRole.ADMIN), async (_req, res) => {
    try {
        const pendingPurchases = await prisma.purchase.findMany({
            where: { status: PurchaseStatus.PENDING },
            include: {
                pkg: true,
                owner: {
                    include: { user: { select: { name: true, email: true } } }
                }
            },
            orderBy: { createdAt: 'asc' },
        });
        res.status(200).json(pendingPurchases);
    }
    catch (error) {
        console.error("ERRO ADMIN ao buscar compras pendentes:", error);
        res.status(500).json({ error: 'Falha ao obter lista de compras pendentes.' });
    }
});
// ROTA PUT /admin/:id/confirm: Confirmar e processar uma compra
// Requer autenticação e permissão de Administrador
router.put('/admin/:id/confirm', checkAuth, checkRole(UserRole.ADMIN), async (req, res) => {
    const { id: purchaseId } = req.params;
    try {
        // Usa uma transação para garantir que a compra seja confirmada E o saldo seja atualizado.
        const confirmedPurchase = await prisma.$transaction(async (tx) => {
            // 1. Confirma a compra e obtém os dados
            const purchase = await tx.purchase.update({
                where: { id: purchaseId, status: PurchaseStatus.PENDING },
                data: {
                    status: PurchaseStatus.CONFIRMED,
                    confirmedAt: new Date(),
                },
                include: { pkg: true, owner: true },
            });
            // Se a compra já estava confirmada ou não existia, o update falha e lança um erro.
            if (!purchase) {
                throw new Error("Compra não encontrada ou já processada.");
            }
            // 2. Atualiza o saldo do proprietário
            await tx.owner.update({
                where: { id: purchase.ownerId },
                data: {
                    ascBalance: {
                        increment: purchase.pkg.coins // Adiciona as moedas do pacote
                    }
                }
            });
            // 3. Cria um registro de transação (opcional, mas recomendado)
            await tx.transaction.create({
                data: {
                    userId: purchase.ownerId,
                    type: 'PURCHASE',
                    amount: purchase.pkg.coins,
                    description: `Crédito de ${purchase.pkg.coins} ASC após compra.`,
                }
            });
            return purchase;
        });
        res.status(200).json(confirmedPurchase);
    }
    catch (error) {
        const errorMessage = error.message;
        console.error("ERRO ADMIN ao confirmar compra:", error);
        if (errorMessage.includes("Compra não encontrada")) {
            return res.status(404).json({ error: errorMessage });
        }
        res.status(500).json({ error: 'Falha ao confirmar a compra e atualizar o saldo.' });
    }
});
export default router;
