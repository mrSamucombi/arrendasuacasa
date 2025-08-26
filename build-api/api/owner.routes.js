// api/owner.routes.ts
import { Router } from 'express'; // <-- Corrigido e consolidado
import { prisma } from '../lib/prisma.js';
import { checkAuth } from '../middleware/auth.middleware.js';
import { VerificationStatus } from '@prisma/client';
const router = Router();
// Rota para obter dados de um proprietário
router.get('/:id', checkAuth, async (req, res) => {
    try {
        const owner = await prisma.owner.findUnique({
            where: { id: req.params.id },
            include: { user: { select: { name: true, email: true } } }
        });
        if (!owner) {
            return res.status(404).json({ error: "Perfil de proprietário não encontrado." });
        }
        res.json(owner);
    }
    catch (error) {
        res.status(500).json({ error: 'Falha ao buscar dados do proprietário.' });
    }
});
// Rota para o proprietário submeter os seus documentos
router.put('/initiate-verification', checkAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    const ownerId = req.user.uid;
    const { phone, documentUrl, selfieUrl } = req.body;
    if (!documentUrl || !selfieUrl || !phone) {
        return res.status(400).json({ error: 'Dados insuficientes para a verificação.' });
    }
    try {
        const updatedOwner = await prisma.owner.update({
            where: { id: ownerId },
            data: {
                phoneNumber: phone,
                verificationDocumentUrl: documentUrl,
                verificationSelfieUrl: selfieUrl,
                verificationStatus: VerificationStatus.PENDING,
            }
        });
        res.status(200).json(updatedOwner);
    }
    catch (error) {
        console.error("Erro ao iniciar verificação:", error);
        res.status(500).json({ error: 'Falha ao iniciar verificação.' });
    }
});
export default router;
