import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { checkAuth } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';
import { z } from 'zod';S
import { updateUserProfileSchema } from '../lib/schemas.js';

const router = Router();

// Helper para buscar o perfil completo (evita duplicação)
async function getFullUserProfile(userId: string) {
    const userWithProfile = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            owner: true,
            client: { include: { favoriteProperties: true } }
        }
    });
    if (!userWithProfile) throw new Error("Utilizador não encontrado no Prisma.");

    // CORREÇÃO DO ERRO DE DIGITAÇÃO AQUI
    const profileData = userWithProfile.role === 'CLIENT' ? userWithProfile.client : userWithProfile.owner;

    const finalUserProfile = {
        id: userWithProfile.id,
        email: userWithProfile.email,
        name: userWithProfile.name,
        ...profileData
    };
    return {
        user: finalUserProfile,
        role: userWithProfile.role
    };
}

router.put('/me', checkAuth, async (req: any, res) => {
    const userId = req.user.uid;
    try {
        const validatedData = updateUserProfileSchema.parse(req.body);
        const { name, phoneNumber, profilePictureUrl } = validatedData;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado." });
        }

        await prisma.$transaction(async (tx) => {
            if (name !== undefined) {
                await tx.user.update({ where: { id: userId }, data: { name } });
            }

            if (user.role === UserRole.OWNER) {
                const ownerDataToUpdate: any = {};
                if (phoneNumber !== undefined) ownerDataToUpdate.phoneNumber = phoneNumber;
                if (profilePictureUrl !== undefined) ownerDataToUpdate.profilePictureUrl = profilePictureUrl;
                if (Object.keys(ownerDataToUpdate).length > 0) {
                    await tx.owner.update({ where: { id: userId }, data: ownerDataToUpdate });
                }
            } else if (user.role === UserRole.CLIENT) {
                if (profilePictureUrl !== undefined) {
                    await tx.client.update({ where: { id: userId }, data: { profilePictureUrl } });
                }
            }
        });

        const fullUpdatedProfile = await getFullUserProfile(userId);
        res.status(200).json(fullUpdatedProfile);
        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "Dados inválidos.", details: error.flatten().fieldErrors });
        }
        console.error("ERRO CRÍTICO AO ATUALIZAR PERFIL:", error);
        res.status(500).json({ error: 'Falha ao atualizar o perfil.' });
    }
});

export default router;