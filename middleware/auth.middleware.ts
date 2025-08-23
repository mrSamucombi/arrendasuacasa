// middleware/auth.middleware.ts
import { auth as firebaseAuth } from '../lib/firebaseAdmin.js';
import { prisma } from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';

export const checkPropertyOwnership = async (req: Request, res: Response, next: NextFunction) => { 
  console.log("\n--- Middleware 'checkPropertyOwnership' ATIVADO ---");

  try {
    // 1. Obter os IDs necessários
    const { id: propertyId } = req.params; // Pega o ID do imóvel da URL (ex: /api/properties/clwfjb1230000abc)
    const firebaseUser = req.user;         // Pega os dados do utilizador anexados pelo 'checkAuth'

    if (!firebaseUser || !firebaseUser.uid) {
      console.error("FALHA no checkPropertyOwnership: 'req.user' não encontrado. O middleware 'checkAuth' foi executado antes?");
      return res.status(403).send({ error: 'Acesso negado: Informação de utilizador em falta.' });
    }
    const userId = firebaseUser.uid;

    if (!propertyId) {
      console.error("FALHA no checkPropertyOwnership: ID do imóvel não encontrado nos parâmetros da rota.");
      return res.status(400).send({ error: 'Requisição inválida: O ID do imóvel é obrigatório.' });
    }

    console.log(`[checkPropertyOwnership] A verificar se o Utilizador (ID: ${userId}) é proprietário do Imóvel (ID: ${propertyId})`);

    // 2. Consultar o imóvel na base de dados
    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
      select: {
        ownerId: true, // Otimização: só precisamos de buscar o campo ownerId
      },
    });

    if (!property) {
      console.warn(`[checkPropertyOwnership] AVISO: Tentativa de acesso a um imóvel que não existe (ID: ${propertyId}).`);
      return res.status(404).send({ error: 'Imóvel não encontrado.' });
    }

    // 3. Comparar os IDs
    console.log(`[checkPropertyOwnership] Comparando: Dono do Imóvel ('${property.ownerId}') === Utilizador da Requisição ('${userId}')`);

    if (property.ownerId === userId) {
      console.log("[checkPropertyOwnership] SUCESSO: Acesso concedido. O utilizador é o proprietário.");
      next(); // Tudo certo, o utilizador é o dono. Pode continuar.
    } else {
      console.error(`[checkPropertyOwnership] FALHA: Acesso negado. O utilizador ${userId} tentou aceder a um recurso do proprietário ${property.ownerId}.`);
      return res.status(403).send({ error: 'Acesso negado: Você não tem permissão para modificar este imóvel.' });
    }

  } catch (error) {
    console.error("[checkPropertyOwnership] ERRO CRÍTICO dentro do middleware:", error);
    res.status(500).send({ error: 'Erro interno ao verificar a propriedade do imóvel.' });
  }
};



export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  console.log("\n--- Middleware 'checkAuth' ATIVADO ---");
  
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    console.error("FALHA no checkAuth: Token não fornecido no cabeçalho Authorization.");
    return res.status(401).send({ error: 'Não autorizado: Token não fornecido.' });
  }

  console.log("Token recebido:", token.substring(0, 30) + "..."); // Mostrar apenas o início do token

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    console.log("SUCESSO no checkAuth: Token verificado com sucesso para o UID:", decodedToken.uid);
    req.user = decodedToken; // Anexar o utilizador à requisição
    next(); // Passar para a próxima função (a sua lógica de rota)
  } catch (error) {
    console.error("FALHA CRÍTICA no checkAuth: firebaseAuth.verifyIdToken(token) falhou.");
    console.error("Erro detalhado:", error); // <-- ESTE LOG É O MAIS IMPORTANTE
    return res.status(403).send({ error: 'Não autorizado: Token inválido ou expirado.' });
  }
};

// DENTRO DE middleware/auth.middleware.ts

export const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
  console.log("\n--- Middleware 'checkAdmin' ATIVADO ---");
  
  try {
    const firebaseUser = req.user;
    if (!firebaseUser || !firebaseUser.uid) {
      console.error("FALHA no checkAdmin: 'req.user' ou 'req.user.uid' não encontrado após o checkAuth.");
      return res.status(403).send({ error: 'Acesso negado: Informação de utilizador em falta.' });
    }

    const userId = firebaseUser.uid;
    console.log(`[checkAdmin] A procurar utilizador no Prisma com ID: ${userId}`);

    const userFromDb = await prisma.user.findUnique({ where: { id: userId } });

    if (!userFromDb) {
      console.error(`[checkAdmin] FALHA: Utilizador com ID ${userId} não foi encontrado na base de dados do Prisma.`);
      return res.status(403).send({ error: 'Acesso negado: Perfil de utilizador não existe.' });
    }

    // O LOG MAIS IMPORTANTE
    console.log(`[checkAdmin] Utilizador encontrado:`, userFromDb);
    console.log(`[checkAdmin] A comparar: userFromDb.role ('${userFromDb.role}') === 'ADMIN'`);

    if (userFromDb.role === 'ADMIN') {
      console.log("[checkAdmin] SUCESSO: Acesso concedido.");
      next(); // O utilizador é um admin, continuar para a próxima rota
    } else {
      console.error(`[checkAdmin] FALHA: O role do utilizador é '${userFromDb.role}', mas era esperado 'ADMIN'.`);
      return res.status(403).send({ error: 'Acesso negado: Requer privilégios de Administrador.' });
    }
  } catch (error) {
    console.error("[checkAdmin] ERRO CRÍTICO dentro do middleware:", error);
    res.status(500).send({ error: 'Erro interno ao verificar permissões de administrador.' });
  }
};