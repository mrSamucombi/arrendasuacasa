// api/types/express.d.ts
import { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    export interface Request {
      user?: DecodedIdToken;
    }
  }
}
export {}; // Garante que é tratado como um módulo