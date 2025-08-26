// lib/firebaseAdmin.ts
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config();
// Validação para garantir que as variáveis de ambiente existem
if (!process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error("As variáveis de ambiente do Firebase não estão definidas.");
}
// Construção correta do objeto ServiceAccount
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // O Render precisa que os '\n' no private key sejam substituídos por novas linhas reais
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};
// Inicialização da aplicação Firebase
const app = initializeApp({
    credential: cert(serviceAccount),
});
console.log("Firebase Admin SDK inicializado com sucesso.");
// Exportação dos serviços que você vai usar noutros locais
export const auth = getAuth(app);
