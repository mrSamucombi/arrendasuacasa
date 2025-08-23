// types/express.d.ts
import { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    export interface Request {
      // Adiciona a propriedade 'user' opcional ao tipo Request
      user?: DecodedIdToken;
    }
  }
}

// Adicione esta linha vazia para garantir que é tratado como um módulo
export {}; 