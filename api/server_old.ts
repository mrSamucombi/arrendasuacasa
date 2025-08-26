import express from 'express';
import cors from 'cors';

import apiRouter from './api/index.js';



const app = express();
const PORT = process.env.PORT || 3001;

// ========================================================================
// CORREÇÃO: Configuração de CORS mais robusta
// ========================================================================
const corsOptions = {
  origin: 'http://localhost:5173', // A origem do seu frontend Vite
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Importante para futuros usos de cookies ou sessões
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Ativar a resposta para 'preflight' requests
app.options('*', cors(corsOptions));

// Aumentar os limites do body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// Roteador principal
app.use('/api', apiRouter);

// Rota de verificação
app.get('/', (_req, res) => res.send('ArrendaSuaCasa API is running!'));

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});