// api/auth.routes.ts

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { checkAuth as authMiddleware } from '../middleware/auth.middleware.js';
import { registerUserSchema } from '../lib/schemas.js';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
// <-- CORRIGIDO: O caminho para a pasta config provavelmente não inclui 'src'
import { authLimiter } from '../src/config/rateLimiter.js'; 

const router = Router();

// --- Rotas de Placeholder (ainda não implementadas) ---

// <-- REMOVIDO: Chamada ao loginController que não existe.
// Adicionada uma implementação de placeholder para o servidor não falhar.
router.post('/login', authLimiter, (req, res) => {
  res.status(501).json({ message: "Endpoint de login ainda não implementado." });
});

// <-- REMOVIDO: Chamada ao forgotPasswordController que não existe.
router.post('/forgot-password', authLimiter, (req, res) => {
  res.status(501).json({ message: "Endpoint de 'esqueci a senha' ainda não implementado." });
});


// --- Rota de Registo Funcional ---

// <-- CORRIGIDO: Rota /register unificada.
// A linha original com 'registerController' foi removida e o 'authLimiter' foi adicionado aqui.
router.post('/register', authLimiter, async (req, res) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);
    const { id, name, email, role, phoneNumber } = validatedData;

    const newUser = await prisma.user.create({
      data: {
        id,
        name,
        email,
        role,
        client: role === UserRole.CLIENT ? { create: {} } : undefined,
        owner: role === UserRole.OWNER ? { create: { phoneNumber: phoneNumber || null } } : undefined,
      }
    });

    res.status(201).json({ message: "Utilizador registado com sucesso", user: newUser });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados de registo inválidos.", details: error.flatten().fieldErrors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Um utilizador com este email já existe.' });
    }
    console.error("ERRO CRÍTICO NA ROTA DE REGISTO:", error);
    res.status(500).json({ error: 'Falha ao registar o utilizador.' });
  }
});


// --- Rota de Perfil Funcional ---

// Nenhuma alteração necessária aqui, o código está ótimo.
router.get('/me', authMiddleware, async (req: any, res) => {
  try {
    const firebaseUid = req.user.uid;
    console.log(`[GET /me] A procurar perfil para User ID: ${firebaseUid}`);

    const userWithProfile = await prisma.user.findUnique({
      where: { id: firebaseUid },
      include: {
        owner: true,
        client: {
          include: {
            favoriteProperties: {
              select: { id: true }
            }
          }
        },
      },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: 'Perfil de utilizador não encontrado na base de dados.' });
    }
    
    console.log("[GET /me] Perfil encontrado com sucesso no Prisma.");
    
    // Simplificando a extração do perfil para maior clareza
    const profileData = userWithProfile.role === 'CLIENT' 
      ? userWithProfile.client 
      : userWithProfile.owner;

    // Criando um payload de resposta limpo
    const responsePayload = {
      user: {
        id: userWithProfile.id,
        email: userWithProfile.email,
        name: userWithProfile.name,
        role: userWithProfile.role,
        ...profileData
      }
    };

    res.status(200).json(responsePayload);

  } catch (error) {
    console.error("--- ERRO CRÍTICO NA ROTA GET /me ---");
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao obter o perfil do utilizador.' });
  }
});

export default router;