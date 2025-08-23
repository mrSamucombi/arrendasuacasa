// lib/schemas.ts (VERSÃO SIMPLIFICADA E GARANTIDA)
import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerUserSchema = z.object({
  id: z.string(), name: z.string(), email: z.string().email(),
  role: z.nativeEnum(UserRole), phoneNumber: z.string().optional(),
});

export const updateUserProfileSchema = z.object({
  name: z.string().optional(), phoneNumber: z.string().optional(), profilePictureUrl: z.string().url().optional(),
});

export const sendMessageSchema = z.object({
  text: z.string(),
});


// Exportação para o frontend
export const propertyFormSchema = createPropertySchema; 

export const initiatePurchaseSchema = z.object({
  pkgId: z.string(),
  proofOfPaymentUrl: z.string().url(),
});