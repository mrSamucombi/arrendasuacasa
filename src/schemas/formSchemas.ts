// DENTRO DE: src/schemas/formSchemas.ts (O NOVO ARQUIVO CORRETO)

import { z } from 'zod';

// NENHUMA importação do '@prisma/client' aqui!

// Este é o schema que o seu formulário de frontend usa.
// Ele não tem nenhuma dependência do lado do servidor.
export const propertyFormSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  address: z.string().min(1, "O endereço é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  price: z.coerce.number().positive("O preço deve ser um valor positivo."),
  bedrooms: z.coerce.number().int().min(0, "O número de quartos não pode ser negativo."),
  bathrooms: z.coerce.number().int().min(0, "O número de banheiros não pode ser negativo."),
  area: z.coerce.number().positive("A área deve ser um valor positivo."),
  // A validação de arquivos no Zod para formulários é um pouco diferente
  images: z.any()
    .refine((files) => files?.length >= 1, "Pelo menos uma imagem é necessária.")
    .refine((files) => files?.length <= 7, "O máximo de 7 imagens é permitido."),
});

export const profileFormSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  profilePicture: z.any().optional(), // Para o <input type="file" />
});