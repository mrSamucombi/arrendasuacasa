// api/purchase.routes.ts

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { checkAuth } from '../middleware/auth.middleware.js';
import { initiatePurchaseSchema } from '../lib/schemas.js';
import { z } from 'zod';

const router = Router();

// Rota para um utilizador buscar o SEU PRÓPRIO histórico de compras
router.get('/', checkAuth, async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado' });
    const ownerId = req.user.uid;

    try {
        const purchases = await prisma.purchase.findMany({
            where: { ownerId: ownerId },
            include: { pkg: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(purchases);
    } catch (error) {
        console.error("Erro ao obter o histórico de compras:", error);
        res.status(500).json({ error: 'Falha ao obter o histórico de compras.' });
    }
});

// Rota para um Proprietário criar um novo pedido de compra
router.post('/', checkAuth, async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado' });
    const ownerId = req.user.uid;
    
    try {
        // Usa o schema simplificado que agora espera 'proofOfPaymentUrl'
        const { pkgId, proofOfPaymentUrl } = initiatePurchaseSchema.parse(req.body);

        const newPurchase = await prisma.purchase.create({
            data: { 
                ownerId: ownerId, 
                pkgId: pkgId, 
                proofOfPaymentUrl: proofOfPaymentUrl, // Usa o nome de campo correto
            },
            include: { pkg: true }
        });
        res.status(201).json(newPurchase);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "Dados inválidos.", details: error.flatten().fieldErrors });
        }
        console.error("Erro ao iniciar compra:", error);
        res.status(500).json({ error: 'Falha ao iniciar compra.' });
    }
});

export default router;