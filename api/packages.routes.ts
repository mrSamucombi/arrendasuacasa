// DENTRO DE api/packages.routes.ts

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Rota para buscar os pacotes e criá-los se não existirem (seeding)
router.get('/', async (req, res) => {
    try {
        const count = await prisma.coinPackage.count();
        if (count === 0) {
            console.log("Nenhum pacote de moedas encontrado. A criar pacotes padrão...");
            await prisma.coinPackage.createMany({
                data: [
                    { id: "pkg-1", description: "Pacote Inicial", coins: 50, price: 5000 },
                    { id: "pkg-2", description: "Mais Popular", coins: 120, price: 10000 },
                    { id: "pkg-3", description: "Melhor Valor", coins: 300, price: 22500 }
                ],
                // CORREÇÃO: A linha 'skipDuplicates: true' foi removida daqui.
            });
            console.log("Pacotes padrão criados com sucesso.");
        }

        const packages = await prisma.coinPackage.findMany();
        res.status(200).json(packages);

    } catch (error) {
        console.error("Erro ao buscar pacotes de moedas:", error);
        res.status(500).json({ error: 'Não foi possível carregar os pacotes de moedas.' });
    }
});

export default router;