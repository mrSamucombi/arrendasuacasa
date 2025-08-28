// api/auth.routes.ts

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { checkAuth as authMiddleware } from '../middleware/auth.middleware.js';
import { registerUserSchema } from '../lib/schemas.js';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { authLimiter } from '../lib/rateLimiter.js'; 

const router = Router();

// ========================================================================
// ROTA DE REGISTO (POST /register) - ESTAVA EM FALTA
// ========================================================================
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);
    const { id, name, email, role, phoneNumber } = validatedData;

    // Usar uma transação para garantir a consistência
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id,
          name,
          email,
          role,
        }
      });

      if (role === UserRole.CLIENT) {
        await tx.client.create({ data: { id: user.id } });
      } else if (role === UserRole.OWNER) {
        await tx.owner.create({ data: { id: user.id, phoneNumber: phoneNumber || null } });
      }
      
      return user;
    });

    res.status(201).json({ message: "Utilizador registado com sucesso", user: newUser });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados de registo inválidos.", details: error.flatten().fieldErrors });
    }
    // Tratar o erro de ID/email duplicado do Prisma
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Um utilizador com este ID ou email já existe.' });
    }
    console.error("ERRO CRÍTICO NA ROTA DE REGISTO:", error);
    res.status(500).json({ error: 'Falha ao registar o utilizador.' });
  }
});

// ========================================================================
// ROTA DE PERFIL (GET /me) - FORMATO DA RESPOSTA CORRIGIDO
// ========================================================================
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Não autorizado" });

  try {
    const firebaseUid = req.user.uid;
    
    const userWithProfile = await prisma.user.findUnique({
      where: { id: firebaseUid },
      include: {
        owner: true,
        client: {
          include: {
            favoriteProperties: { select: { id: true } }
          }
        },
      },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: 'Perfil de utilizador não encontrado na base de dados.' });
    }
    
    // --- CORREÇÃO DO FORMATO DA RESPOSTA ---
    // Agora retornamos o objeto do utilizador diretamente, como o frontend espera
    let finalProfile;
    if (userWithProfile.role === 'OWNER' && userWithProfile.owner) {
        // Combina os dados de User e Owner
        finalProfile = { ...userWithProfile, ...userWithProfile.owner };
    } else if (userWithProfile.role === 'CLIENT' && userWithProfile.client) {
        // Combina os dados de User e Client
        finalProfile = { ...userWithProfile, ...userWithProfile.client };
    } else {
        finalProfile = userWithProfile; // Para ADMINs
    }

    res.status(200).json(finalProfile);

  } catch (error) {
    console.error("--- ERRO CRÍTICO NA ROTA GET /me ---", error);
    res.status(500).json({ error: 'Erro interno ao obter o perfil do utilizador.' });
  }
});

export default router;