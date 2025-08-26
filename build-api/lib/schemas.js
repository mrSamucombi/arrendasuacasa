// DENTRO DE: lib/schemas.ts (A VERSÃO FINAL E CORRETA)
import { z } from 'zod';
import { UserRole } from '@prisma/client';
// 1. A DEFINIÇÃO QUE ESTAVA FALTANDO. AGORA ESTÁ AQUI.
export const createPropertySchema = z.object({
    title: z.string().min(1, "O título é obrigatório."),
    address: z.string().min(1, "O endereço é obrigatório."),
    description: z.string().min(1, "A descrição é obrigatória."),
    price: z.coerce.number(),
    bedrooms: z.coerce.number(),
    bathrooms: z.coerce.number(),
    area: z.coerce.number(),
    imageUrls: z.string().min(1, "Pelo menos uma imagem é necessária."),
});
// 2. O RESTO DOS SEUS SCHEMAS QUE JÁ ESTAVAM CORRETOS
export const registerUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.nativeEnum(UserRole),
    phoneNumber: z.string().optional(),
});
export const updateUserProfileSchema = z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    profilePictureUrl: z.string().url().optional(),
});
export const sendMessageSchema = z.object({
    text: z.string(),
});
export const initiatePurchaseSchema = z.object({
    pkgId: z.string(),
    proofOfPaymentUrl: z.string().url(),
});
// 3. ESTA LINHA AGORA FUNCIONA PORQUE createPropertySchema EXISTE.
export const propertyFormSchema = createPropertySchema;
