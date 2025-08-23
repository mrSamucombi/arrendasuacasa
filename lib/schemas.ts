// lib/schemas.ts

import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Schema para dados recebidos pela ROTA de registo de utilizador
export const registerUserSchema = z.object({
  id: z.string().min(1, "O ID do Firebase é obrigatório."),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Email inválido."),
  role: z.nativeEnum(UserRole),
  phoneNumber: z.string().optional(),
});

// Schema para dados recebidos pela ROTA de atualização de perfil
export const updateUserProfileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres.").optional(),
  phoneNumber: z.string().min(9, "O número de telefone parece inválido.").optional(),
  profilePictureUrl: z.string().url("O URL da foto de perfil é inválido.").optional(),
});

// Schema para dados recebidos pela ROTA de envio de mensagem
export const sendMessageSchema = z.object({
  text: z.string().min(1, "A mensagem não pode estar vazia.").max(500, "A mensagem é demasiado longa."),
});

// Schema para dados recebidos pela ROTA de criação de imóvel
export const createPropertySchema = z.object({
  title: z.string().min(10, { message: "O título deve ter pelo menos 10 caracteres." }),
  address: z.string().min(10, { message: "O endereço deve ter pelo menos 10 caracteres." }),
  description: z.string().min(1, { message: "A descrição é obrigatória." }),
  price: z.coerce.number({ required_error: "O preço é obrigatório.", invalid_type_error: "O preço deve ser um número válido." }).positive(),
  bedrooms: z.coerce.number({ required_error: "O número de quartos é obrigatório.", invalid_type_error: "O número de quartos deve ser um número." }).int().min(0),
  bathrooms: z.coerce.number({ required_error: "O número de WCs é obrigatório.", invalid_type_error: "O número de WCs deve ser um número." }).int().min(0),
  area: z.coerce.number({ required_error: "A área é obrigatória.", invalid_type_error: "A área deve ser um número válido." }).positive(),
  imageUrls: z.string().min(1, { message: "Pelo menos uma imagem é necessária." }),
});

// Schema para dados recebidos pela ROTA de início de compra
export const initiatePurchaseSchema = z.object({
  pkgId: z.string().min(1, "O ID do pacote é obrigatório."),
  // CORRIGIDO para proofOfPayment, para corresponder ao schema.prisma
  proofOfPayment: z.string().url("O URL do comprovativo é inválido."), 
});