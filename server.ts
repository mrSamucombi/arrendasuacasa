// server.ts

// Movi as importações para o topo, o que é a convenção padrão.
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import apiRouter from './api/index.js';
import { generalApiLimiter } from './src/config/rateLimiter.js';
// Você tinha esta importação que não era usada, removi para limpar.
// import propertyRoutes from './api/properties.routes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. CONFIGURAÇÃO DE CORS (COM A CORREÇÃO CRÍTICA) ---
// Vamos usar uma configuração mais robusta para lidar com os pedidos de pré-voo (pre-flight)
const allowedOrigins = [
  'http://localhost:5173',
  'https://arrendasuacasa-front.onrender.com' // Seu URL de produção
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pela política de CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// --- ADIÇÃO #1: Habilita o pré-voo (pre-flight) para TODAS as rotas ---
// Esta linha é crucial para que o CORS funcione com pedidos POST/PUT que enviam headers
app.options('*', cors(corsOptions));

// Usa o middleware CORS para todos os outros pedidos
app.use(cors(corsOptions));


// --- 2. BODY PARSERS ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- 3. ROTEADOR PRINCIPAL (COM A CORREÇÃO CRÍTICA) ---
// A ordem aqui é importante: primeiro o limiter, depois o router.
app.use('/api', generalApiLimiter); 
app.use('/api', apiRouter);

// A linha abaixo era redundante e potencialmente causava problemas,
// pois o `apiRouter` já deve tratar das rotas de propriedades.
// app.use('/api/properties', propertyRoutes); // <--- REMOVIDA

// --- Rota de Health Check ---
app.get('/', (_req, res) => res.send('ArrendaSuaCasa API is running!'));

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});