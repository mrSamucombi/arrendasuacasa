// api/properties.routes.ts (VERSÃO COMPLETA E FINAL)

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { checkAuth, checkPropertyOwnership } from '../middleware/auth.middleware.js';
import { UserRole, PropertyStatus } from '@prisma/client';
import { z } from 'zod';

const router = Router();

// ========================================================================
// Schema de Validação com Zod (CORRIGIDO)
// ========================================================================
const createPropertySchema = z.object({
  title: z.string().min(10, { message: "O título deve ter pelo menos 10 caracteres." }),
  address: z.string().min(10, { message: "O endereço deve ter pelo menos 10 caracteres." }),
  description: z.string().min(1, { message: "A descrição é obrigatória." }),
  price: z.coerce.number({ required_error: "O preço é obrigatório.", invalid_type_error: "O preço deve ser um número válido." }).positive(),
  bedrooms: z.coerce.number({ required_error: "O número de quartos é obrigatório.", invalid_type_error: "O número de quartos deve ser um número." }).int().min(0),
  bathrooms: z.coerce.number({ required_error: "O número de WCs é obrigatório.", invalid_type_error: "O número de WCs deve ser um número." }).int().min(0),
  area: z.coerce.number({ required_error: "A área é obrigatória.", invalid_type_error: "A área deve ser um número válido." }).positive(),
  imageUrls: z.string().min(1, { message: "Pelo menos uma imagem é necessária." }),
});

// ========================================================================
// ROTAS DA API
// ========================================================================

// --- ROTA DE CRIAÇÃO DE IMÓVEL ---
router.post('/', checkAuth, async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado' });
    const ownerId = req.user.uid;
    const PUBLISH_COST = 10;
    
    try {
        const validatedData = createPropertySchema.parse(req.body);
        const owner = await prisma.owner.findUnique({ where: { id: ownerId }, include: { user: true }});
        if (!owner || owner.user.role !== UserRole.OWNER) return res.status(403).json({ error: 'Apenas proprietários podem publicar imóveis.' });
        if (owner.ascBalance < PUBLISH_COST) return res.status(403).json({ error: 'Saldo de moedas ASC insuficiente para publicar.' });

        const newProperty = await prisma.$transaction(async (tx) => {
            await tx.owner.update({ where: { id: ownerId }, data: { ascBalance: { decrement: PUBLISH_COST } } });
            const property = await tx.property.create({ data: { ...validatedData, owner: { connect: { id: ownerId } } }});
            await tx.transaction.create({ data: { userId: ownerId, type: 'PUBLISH', amount: -PUBLISH_COST, description: `Publicação do imóvel: ${property.title}` }});
            return property;
        });
        res.status(201).json(newProperty);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: "Dados inválidos.", details: error.flatten().fieldErrors });
        console.error("ERRO ao criar imóvel:", error);
        res.status(500).json({ error: 'Falha ao criar o imóvel.' });
    }
});

// --- ROTA DE DESATIVAÇÃO ---
router.patch('/:id/deactivate', checkAuth, checkPropertyOwnership, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedProperty = await prisma.property.update({
            where: { id: id },
            data: { status: PropertyStatus.UNAVAILABLE },
        });
        res.status(200).json(updatedProperty);
    } catch (error) {
        console.error("ERRO ao desativar imóvel:", error);
        res.status(500).json({ error: 'Falha ao desativar o imóvel.' });
    }
});

// --- ROTA DE REATIVAÇÃO ---
router.patch('/:id/reactivate', checkAuth, checkPropertyOwnership, async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Não autorizado' });
    const { id: propertyId } = req.params;
    const ownerId = req.user.uid;
    const REACTIVATION_COST = 5;
    try {
        const owner = await prisma.owner.findUnique({ where: { id: ownerId } });
        if (!owner) return res.status(404).json({ error: "Perfil de proprietário não encontrado." });
        if (owner.ascBalance < REACTIVATION_COST) return res.status(403).json({ error: `Saldo insuficiente. São necessárias ${REACTIVATION_COST} ASC.` }); 

        const updatedProperty = await prisma.$transaction(async (tx) => {
            await tx.owner.update({ where: { id: ownerId }, data: { ascBalance: { decrement: REACTIVATION_COST } } });
            const property = await tx.property.update({ where: { id: propertyId }, data: { status: PropertyStatus.AVAILABLE } });
            await tx.transaction.create({ data: { userId: ownerId, type: 'REACTIVATE', amount: -REACTIVATION_COST, description: `Reativação do imóvel: ${property.title}` }});
            return property;
        });
        res.status(200).json(updatedProperty);
    } catch (error) { 
        console.error("ERRO ao reativar imóvel:", error);
        res.status(500).json({ error: 'Falha ao reativar o imóvel.' }); 
    }
});

// --- ROTA GET ---
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;
        const take = limit;
        const { searchTerm, minPrice, maxPrice, bedrooms } = req.query;

        let whereClause: any = { status: PropertyStatus.AVAILABLE, };
        if (searchTerm) { whereClause.OR = [ { title: { contains: searchTerm as string, mode: 'insensitive' } }, { address: { contains: searchTerm as string, mode: 'insensitive' } }, ]; }
        if (minPrice || maxPrice) { whereClause.price = {}; if (minPrice) whereClause.price.gte = parseFloat(minPrice as string); if (maxPrice) whereClause.price.lte = parseFloat(maxPrice as string); }
        if (bedrooms) { whereClause.bedrooms = { gte: parseInt(bedrooms as string, 10) }; }

        const [properties, totalProperties] = await prisma.$transaction([
            prisma.property.findMany({ 
                where: whereClause, 
                skip: skip,
                take: take, 
                orderBy: { createdAt: 'desc' }, 
                include: { owner: { include: { user: { select: { name: true } } } } } 
            }),
            prisma.property.count({ where: whereClause })
        ]);
        
        const totalPages = Math.ceil(totalProperties / limit);
        res.status(200).json({ data: properties, pagination: { currentPage: page, totalPages, totalItems: totalProperties } });
    } catch (error) {
        console.error("--- ERRO CRÍTICO NA ROTA GET /properties ---", error);
        res.status(500).json({ error: 'Falha ao buscar os imóveis.' });
    }
});

export default router;