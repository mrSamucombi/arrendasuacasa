// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // --- PLUGINS ---
  // Adiciona o suporte oficial do Vite para React (compilação JSX, Fast Refresh, etc.)
  plugins: [react()],

  // --- RESOLVE ---
  // Permite configurar como os módulos são resolvidos.
  resolve: {
    // Cria um atalho (alias) para importações. Em vez de '../../components',
    // você pode simplesmente escrever '@/components'.
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // --- SERVIDOR DE DESENVOLVIMENTO ---
  // Configura o comportamento do servidor local (quando você corre 'npm run dev')
  server: {
    port: 5173, // Define a porta padrão
    open: true,   // Abre o browser automaticamente ao iniciar o servidor
    
    // --- PROXY PARA A API (MUITO IMPORTANTE!) ---
    // Redireciona os pedidos do frontend para o backend para evitar problemas de CORS.
    // Quando o seu código frontend faz uma chamada para '/api/properties',
    // o Vite irá, na verdade, enviá-la para 'http://localhost:3001/api/properties'.
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // O endereço do seu backend local
        changeOrigin: true, // Necessário para virtual hosts
        secure: false,      // Não verifica certificados SSL (útil para localhost)
      },
    },
  },

  // --- BUILD ---
  // Configurações para o processo de build (quando você corre 'npm run build')
  build: {
    outDir: 'dist', // A pasta onde os ficheiros de produção serão gerados
    sourcemap: true, // Gera sourcemaps para facilitar a depuração em produção
  },
});
// Forçar deploy

// Adicionar exceções para os ficheiros de configuração importantes
!vite.config.js
!tailwind.config.js
!postcss.config.cjs