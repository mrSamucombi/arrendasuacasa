// api/messages.routes.ts
import { Router } from 'express'; // <-- Apenas uma importação
import { prisma } from '../lib/prisma.js';
import { checkAuth } from '../middleware/auth.middleware.js';
import { sendMessageSchema } from '../lib/schemas.js';
import { z } from 'zod';
const router = Router();
// Obter/Criar uma conversa
router.get('/property/:propertyId', checkAuth, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Não autorizado' });
    const { propertyId } = req.params;
    const userId = req.user.uid;
    try {
        let conversation = await prisma.conversation.findFirst({
            where: { propertyId, participants: { some: { id: userId } } },
            include: {
                messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true } } } }, // <-- CORRIGIDO
                participants: { select: { id: true, name: true } },
                property: { select: { title: true } }
            }
        });
        if (!conversation) {
            const property = await prisma.property.findUnique({ where: { id: propertyId } });
            if (!property)
                return res.status(404).json({ error: "Imóvel não encontrado." });
            if (property.ownerId === userId)
                return res.status(400).json({ error: "Não pode iniciar uma conversa sobre o seu próprio imóvel." });
            conversation = await prisma.conversation.create({
                data: {
                    propertyId,
                    participants: { connect: [{ id: userId }, { id: property.ownerId }] }
                },
                include: {
                    messages: { include: { sender: { select: { id: true, name: true } } } }, // <-- CORRIGIDO
                    participants: { select: { id: true, name: true } },
                    property: { select: { title: true } }
                }
            });
        }
        res.status(200).json(conversation);
    }
    catch (error) {
        res.status(500).json({ error: "Falha ao processar a conversa." });
    }
});
// ========================================================================
// ROTA 2: Enviar uma nova mensagem
// ========================================================================
router.post('/:conversationId', checkAuth, async (req, res) => {
    try {
        const { text } = sendMessageSchema.parse(req.body);
        const { conversationId } = req.params;
        const senderId = req.user.uid;
        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId, participants: { some: { id: senderId } } }
        });
        if (!conversation) {
            return res.status(403).json({ error: "Não autorizado a enviar mensagens para esta conversa." });
        }
        const newMessage = await prisma.message.create({
            data: { text, senderId, conversationId },
            include: { sender: { select: { id: true, name: true } } }
        });
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        res.status(201).json(newMessage);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "Mensagem inválida.", details: error.flatten().fieldErrors });
        }
        console.error("Erro ao enviar mensagem:", error);
        res.status(500).json({ error: "Falha ao enviar a mensagem." });
    }
});
// ========================================================================
// ROTA 3: Obter todas as conversas do utilizador
// ========================================================================
router.get('/', checkAuth, async (req, res) => {
    const userId = req.user.uid;
    try {
        const conversations = await prisma.conversation.findMany({
            where: { participants: { some: { id: userId } } },
            orderBy: { updatedAt: 'desc' },
            include: {
                participants: { select: { id: true, name: true } },
                property: { select: { title: true, imageUrls: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 }
            }
        });
        res.status(200).json(conversations);
    }
    catch (error) {
        console.error("Erro ao obter as conversas:", error);
        res.status(500).json({ error: "Falha ao obter as conversas." });
    }
});
// ========================================================================
// ROTA 4: Marcar mensagens como lidas
// ========================================================================
router.put('/:conversationId/read', checkAuth, async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.uid;
    try {
        await prisma.message.updateMany({
            where: {
                conversationId: conversationId,
                senderId: { not: userId }
            },
            data: { isRead: true }
        });
        res.status(200).json({ message: "Mensagens marcadas como lidas." });
    }
    catch (error) {
        console.error("Erro ao marcar mensagens como lidas:", error);
        res.status(500).json({ error: "Falha ao atualizar as mensagens." });
    }
});
export default router;
