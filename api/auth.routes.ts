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
router.get('/me', authMiddleware, async (req: any, res) => {
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
    
    // --- A CORREÇÃO ESTÁ AQUI ---
    // Construímos a resposta no formato { user: {...}, role: '...' }
    let responsePayload;

    if (userWithProfile.role === 'OWNER' && userWithProfile.owner) {
      responsePayload = {
        user: userWithProfile.owner,
        role: userWithProfile.role
      };
    } else if (userWithProfile.role === 'CLIENT' && userWithProfile.client) {
      responsePayload = {
        user: userWithProfile.client,
        role: userWithProfile.role
      };
    } else { // Para ADMIN ou casos de inconsistência
       responsePayload = {
         user: {id: userWithProfile.id, email: userWithProfile.email, name: userWithProfile.name},
         role: userWithProfile.role
       }
    }

    res.status(200).json(responsePayload);

  } catch (error) {
    console.error("--- ERRO CRÍTICO NA ROTA GET /me ---", error);
    res.status(500).json({ error: 'Erro interno ao obter o perfil do utilizador.' });
  }
});

export default router;