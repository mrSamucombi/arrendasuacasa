import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { checkAuth, checkAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Aplica os middlewares a todas as rotas deste ficheiro
router.get('/stats', checkAuth, checkAdmin, async (req, res) => {
    try {
        // Usar Promise.all para executar todas as contagens em paralelo
        const [
            totalOwners,
            totalClients,
            totalProperties,
            pendingVerifications,
            pendingPurchases
        ] = await Promise.all([
            prisma.owner.count(),
            prisma.client.count(),
            prisma.property.count(),
            prisma.owner.count({ where: { verificationStatus: 'PENDING' } }),
            prisma.purchase.count({ where: { status: 'PENDING' } })
        ]);

        const stats = {
            totalUsers: totalOwners + totalClients,
            totalProperties,
            pendingVerifications,
            pendingPurchases
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error("Erro ao buscar estatísticas do admin:", error);
        res.status(500).json({ error: "Falha ao buscar estatísticas." });
    }
});

router.use(checkAuth, checkAdmin);

router.get('/purchases', async (req, res) => {
    try {
        const purchases = await prisma.purchase.findMany({
            where: { status: 'PENDING' },
            include: {
                pkg: true,
                owner: { select: { user: { select: { name: true, email: true } } } }
            },
            orderBy: { createdAt: 'asc' }
        });
        // Formatar a resposta para ser mais limpa
        const formattedPurchases = purchases.map(p => ({
            ...p,
            owner: p.owner?.user // Aplanar a estrutura
        }));
        res.json(formattedPurchases);
    } catch (error) {
        console.error("Erro ao buscar compras pendentes:", error);
        res.status(500).json({ error: 'Falha ao buscar compras pendentes.' });
    }
});

router.put('/purchases/:id/confirm', async (req, res) => {
    const { id } = req.params;
    try {
        const purchase = await prisma.purchase.findUnique({
            where: { id },
            include: { pkg: true }
        });
        if (!purchase) {
            return res.status(404).json({ error: 'Compra não encontrada.' });
        }
        if (purchase.status === 'CONFIRMED') {
            return res.status(400).json({ error: 'Esta compra já foi confirmada.' });
        }
        const updatedPurchase = await prisma.$transaction(async (tx) => {
            await tx.owner.update({
                where: { id: purchase.ownerId },
                data: { ascBalance: { increment: purchase.pkg.coins } }
            });
            return tx.purchase.update({
                where: { id },
                data: { status: 'CONFIRMED', confirmedAt: new Date() }
            });
        });
        res.json({ message: 'Compra confirmada com sucesso.', purchase: updatedPurchase });
    } catch (error) {
        console.error("Erro ao confirmar compra:", error);
        res.status(500).json({ error: 'Falha ao confirmar a compra.' });
    }
});

router.get('/verifications', checkAuth, checkAdmin, async (req, res) => {
    try {
        const usersToVerify = await prisma.owner.findMany({
            where: { verificationStatus: 'PENDING' },
            // GARANTA QUE ESTE BLOCO 'include' ESTÁ EXATAMENTE ASSIM
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.status(200).json(usersToVerify);
    } catch (error) {
        console.error("Erro ao buscar verificações pendentes:", error);
        res.status(500).json({ error: "Falha ao buscar verificações pendentes." });
    }
});

router.put('/verifications/:ownerId/confirm', checkAuth, checkAdmin, async (req, res) => {
    const { ownerId } = req.params;
    try {
        const owner = await prisma.owner.findUnique({ where: { id: ownerId } });

        if (!owner) {
            return res.status(404).json({ error: 'Proprietário não encontrado.' });
        }
        if (owner.verificationStatus !== 'PENDING') {
            return res.status(400).json({ error: 'Este utilizador não tem uma verificação pendente.' });
        }

        const updatedOwner = await prisma.owner.update({
            where: { id: ownerId },
            data: { 
                // A única responsabilidade do admin aqui é mudar o status
                verificationStatus: 'VERIFIED' 
            }
        });
        res.status(200).json(updatedOwner);
    } catch (error) {
        console.error(`Erro ao confirmar a verificação para o owner ${ownerId}:`, error);
        res.status(500).json({ error: "Falha ao confirmar a verificação." });
    }
});

export default router;