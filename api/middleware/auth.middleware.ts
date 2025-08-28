import { auth as firebaseAuth } from '../lib/firebaseAdmin.js';
import { prisma } from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

// ========================================================================
// 1. MIDDLEWARE DE AUTENTICAÇÃO (checkAuth)
// Este é o middleware principal. Valida o token e anexa `user` ao `req`.
// ========================================================================
export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  console.log("\n--- Middleware 'checkAuth' ATIVADO ---");
  
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    console.error("FALHA no checkAuth: Token não fornecido no cabeçalho Authorization.");
    return res.status(401).send({ error: 'Não autorizado: Token não fornecido.' });
  }

  console.log("Token recebido:", token.substring(0, 30) + "...");

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    console.log("SUCESSO no checkAuth: Token verificado com sucesso para o UID:", decodedToken.uid);
    req.user = decodedToken; // A nossa declaração de tipos global permite isto
    next();
  } catch (error) {
    console.error("FALHA CRÍTICA no checkAuth: firebaseAuth.verifyIdToken(token) falhou.");
    console.error("Erro detalhado:", error);
    return res.status(403).send({ error: 'Não autorizado: Token inválido ou expirado.' });
  }
};

// ========================================================================
// 2. MIDDLEWARE DE VERIFICAÇÃO DE PERMISSÃO (checkAdmin)
// DEVE ser usado DEPOIS de `checkAuth`.
// ========================================================================
export const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
  console.log("\n--- Middleware 'checkAdmin' ATIVADO ---");
  
  // A verificação de `req.user` é crucial para a segurança de tipos
  if (!req.user || !req.user.uid) {
    console.error("FALHA no checkAdmin: 'req.user' não encontrado após o checkAuth.");
    return res.status(403).send({ error: 'Acesso negado: Informação de utilizador em falta.' });
  }

  try {
    const userId = req.user.uid;
    console.log(`[checkAdmin] A procurar utilizador no Prisma com ID: ${userId}`);

    const userFromDb = await prisma.user.findUnique({ where: { id: userId } });

    if (!userFromDb) {
      console.error(`[checkAdmin] FALHA: Utilizador com ID ${userId} não foi encontrado na base de dados do Prisma.`);
      return res.status(403).send({ error: 'Acesso negado: Perfil de utilizador não existe.' });
    }

    console.log(`[checkAdmin] Utilizador encontrado:`, userFromDb);
    console.log(`[checkAdmin] A comparar: userFromDb.role ('${userFromDb.role}') === 'ADMIN'`);

    if (userFromDb.role === UserRole.ADMIN) {
      console.log("[checkAdmin] SUCESSO: Acesso concedido.");
      next();
    } else {
      console.error(`[checkAdmin] FALHA: O role do utilizador é '${userFromDb.role}', mas era esperado 'ADMIN'.`);
      return res.status(403).send({ error: 'Acesso negado: Requer privilégios de Administrador.' });
    }
  } catch (error) {
    console.error("[checkAdmin] ERRO CRÍTICO dentro do middleware:", error);
    res.status(500).send({ error: 'Erro interno ao verificar permissões de administrador.' });
  }
};

// ========================================================================
// 3. MIDDLEWARE DE VERIFICAÇÃO DE PROPRIEDADE
// DEVE ser usado DEPOIS de `checkAuth`.
// ========================================================================
export const checkPropertyOwnership = async (req: Request, res: Response, next: NextFunction) => { 
  console.log("\n--- Middleware 'checkPropertyOwnership' ATIVADO ---");

  if (!req.user || !req.user.uid) {
    console.error("FALHA no checkPropertyOwnership: 'req.user' não encontrado após o checkAuth.");
    return res.status(403).send({ error: 'Acesso negado: Informação de utilizador em falta.' });
  }

  try {
    const { id: propertyId } = req.params;
    const userId = req.user.uid;

    if (!propertyId) {
      console.error("FALHA no checkPropertyOwnership: ID do imóvel não encontrado nos parâmetros da rota.");
      return res.status(400).send({ error: 'Requisição inválida: O ID do imóvel é obrigatório.' });
    }

    console.log(`[checkPropertyOwnership] A verificar se o Utilizador (ID: ${userId}) é proprietário do Imóvel (ID: ${propertyId})`);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });

    if (!property) {
      console.warn(`[checkPropertyOwnership] AVISO: Tentativa de acesso a um imóvel que não existe (ID: ${propertyId}).`);
      return res.status(404).send({ error: 'Imóvel não encontrado.' });
    }

    console.log(`[checkPropertyOwnership] Comparando: Dono do Imóvel ('${property.ownerId}') === Utilizador da Requisição ('${userId}')`);

    if (property.ownerId === userId) {
      console.log("[checkPropertyOwnership] SUCESSO: Acesso concedido. O utilizador é o proprietário.");
      next();
    } else {
      console.error(`[checkPropertyOwnership] FALHA: Acesso negado. O utilizador ${userId} tentou aceder a um recurso do proprietário ${property.ownerId}.`);
      return res.status(403).send({ error: 'Acesso negado: Você não tem permissão para modificar este imóvel.' });
    }
  } catch (error) {
    console.error("[checkPropertyOwnership] ERRO CRÍTICO dentro do middleware:", error);
    res.status(500).send({ error: 'Erro interno ao verificar a propriedade do imóvel.' });
  }
};

// --- FUNÇÃO checkRole (mantida do seu código original) ---
// Uma forma mais genérica de verificar permissões
export const checkRole = (requiredRole: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    try {
      const userRecord = await prisma.user.findUnique({
        where: { id: req.user.uid },
      });

      if (!userRecord || userRecord.role !== requiredRole) {
        return res.status(403).json({ error: 'Acesso negado. Permissões insuficientes.' });
      }

      next();
    } catch (error) {
      console.error("Erro ao verificar a permissão do utilizador:", error);
      return res.status(500).json({ error: 'Erro interno ao verificar permissões.' });
    }
  };
};