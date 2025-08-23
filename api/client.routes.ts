// api/client.routes.ts

import { Router, Request, Response } from 'express'; // <-- Apenas uma importação, com todos os tipos
import { prisma } from '../lib/prisma.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/toggle-favorite/:propertyId', checkAuth, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    const clientId = req.user.uid;
    const { propertyId } = req.params;
    
    console.log(`\n--- [BACKEND] Rota /toggle-favorite atingida ---`);
    console.log(`Cliente ID: ${clientId}, Imóvel ID: ${propertyId}`);

    try {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            select: { favoriteProperties: { select: { id: true } } }
        });

        if (!client) {
            console.error("[BACKEND] FALHA: Cliente não encontrado.");
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        const isCurrentlyFavorite = client.favoriteProperties.some(p => p.id === propertyId);
        console.log(`[BACKEND] O imóvel já é favorito? ${isCurrentlyFavorite}. Ação a tomar: ${isCurrentlyFavorite ? 'disconnect' : 'connect'}`);
        
        await prisma.client.update({
            where: { id: clientId },
            data: {
                favoriteProperties: {
                    [isCurrentlyFavorite ? 'disconnect' : 'connect']: { id: propertyId }
                }
            }
        });
        
        console.log("[BACKEND] SUCESSO: Operação no Prisma concluída.");
        res.status(200).json({ message: 'Favoritos atualizados com sucesso.' });

    } catch (error) {
        console.error("[BACKEND] ERRO CRÍTICO ao alternar favorito:", error);
        res.status(500).json({ error: 'Falha ao atualizar favoritos.' });
    }
});

export default router;