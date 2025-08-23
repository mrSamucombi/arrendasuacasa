// server.ts (Versão Final e Corrigida)

import dotenv from 'dotenv';
// Garante que as variáveis de ambiente são lidas ANTES de qualquer outra coisa
dotenv.config(); 

import express from 'express';
import cors from 'cors';
import { generalApiLimiter } from './src/config/rateLimiter.js'; // Verifique o caminho
import apiRouter from './api/index.js'; // O seu roteador principal

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. CONFIGURAÇÃO DE CORS PARA PRODUÇÃO E DESENVOLVIMENTO ---
const allowedOrigins = [
  'https://arrendasuacasa-front.onrender.com',
  'http://localhost:5173', // Para o seu desenvolvimento local
  // Adicione aqui o URL que o Render lhe der para o seu frontend quando o publicar
];

app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permite pedidos se a origem estiver na lista ou se não houver origem (ex: Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('A sua origem não é permitida pela política de CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));

// --- 2. MIDDLEWARES ESSENCIAIS ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- 3. MIDDLEWARE DE SEGURANÇA (RATE LIMITER) ---
// Aplica o limiter a todos os endpoints que começam com /api
app.use('/api', generalApiLimiter); 

// --- 4. ROTEADOR PRINCIPAL DA API ---
// Todas as suas rotas (properties, auth, etc.) são geridas pelo apiRouter.
// Esta é a única linha necessária para as rotas da API.
app.use('/api', apiRouter);

// --- 5. ROTA DE HEALTH CHECK (Verificação de Saúde) ---
app.get('/', (_req, res) => res.send('ArrendaSuaCasa API is running!'));

// --- 6. INICIAR O SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});