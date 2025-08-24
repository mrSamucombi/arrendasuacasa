// api/purchase.routes.ts

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { checkAuth } from '../middleware/auth.middleware.js';
import { initiatePurchaseSchema } from '../lib/schemas.js';
import { z } from 'zod';

const router = Router();

// Rota para um utilizador buscar o SEU PRÓPRIO histórico de compras
router.get('/', checkAuth, async (req, res) => { // <-- Adicionado checkAuth
  if (!req.user) return res.status(401).json({ error: "Não autorizado" });
  const userId = req.user.uid;

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

// Rota para um Proprietário criar um novo pedido de comprarouter.post('/', checkAuth, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    // --- A LINHA DE CORREÇÃO ESTÁ AQUI ---
    const ownerId = req.user.uid; // Define ownerId a partir do token do Firebase

    try {
        const validatedData = initiatePurchaseSchema.parse(req.body);

        // Agora 'ownerId' existe e o código funciona
        const newPurchase = await prisma.purchase.create({
            data: {
                ownerId: ownerId, // CORRETO
                pkgId: validatedData.pkgId,
                proofOfPayment: validatedData.proofOfPaymentUrl,
            }
        });
        
        res.status(201).json(newPurchase);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "Dados inválidos.", details: error.flatten().fieldErrors });
        }
        console.error("ERRO ao criar a compra:", error);
        res.status(500).json({ error: 'Falha ao processar a sua compra.' });
    }
});

export default router;