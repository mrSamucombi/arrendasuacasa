// server.ts

// --- 1. Importação de Módulos ---
// dotenv deve ser importado e configurado primeiro para garantir que todas
// as variáveis de ambiente estejam disponíveis para os outros módulos.
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { generalApiLimiter } from './src/config/rateLimiter.js';
import apiRouter from './api/index.js';

// --- 2. Depuração de Variáveis de Ambiente (Opcional, mas útil) ---
// Este bloco ajuda a confirmar que o Render está a carregar as suas variáveis de ambiente.
// Pode ser removido ou comentado após a confirmação.
console.log("--- Verificando Variáveis de Ambiente Essenciais ---");
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Carregada' : 'NÃO ENCONTRADA'}`);
console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Carregado' : 'NÃO ENCONTRADO'}`);
console.log(`FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? 'Carregado' : 'NÃO ENCONTRADO'}`);
console.log("---------------------------------------------------");

// --- 3. Inicialização e Constantes da Aplicação ---
const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// --- 4. Configuração de CORS ---
// A lista de origens permitidas é mais segura e flexível.
const allowedOrigins = [
  'https://arrendasuacasa-front.onrender.com',
  // Pode adicionar mais origens de produção aqui, como domínios customizados.
];

// Em desenvolvimento, permitimos também o localhost.
if (!IS_PRODUCTION) {
  allowedOrigins.push('http://localhost:5173');
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem 'origin' (ex: Postman, apps móveis) ou se a origem estiver na lista.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem não permitida pela política de CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// --- 5. Middlewares Essenciais ---
// Aumentar o limite de payload é importante para o upload de ficheiros.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 6. Rotas da Aplicação ---
// Rota de "health check" para verificar se a API está online.
app.get('/', (_req: Request, res: Response) => {
  res.status(200).send(`ArrendaSuaCasa API está a funcionar! Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
});

// Aplica o rate limiter apenas aos endpoints da API para proteger contra ataques.
app.use('/api', generalApiLimiter);

// Centraliza todas as rotas da API sob o prefixo /api.
app.use('/api', apiRouter);

// --- 7. Tratamento de Erros Global (Error Handling) ---
// Este middleware "pega" qualquer erro que não foi tratado nas suas rotas,
// evitando que o servidor quebre e retornando uma resposta JSON padronizada.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("--- ERRO NÃO TRATADO ---");
  console.error(err.stack);
  console.error("------------------------");
  res.status(500).json({
    error: 'Ocorreu um erro inesperado no servidor.',
    // Em desenvolvimento, podemos enviar mais detalhes do erro.
    details: IS_PRODUCTION ? undefined : err.message,
  });
});

// --- 8. Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor a ouvir em http://localhost:${PORT}`);
});