// src/config/rateLimiter.ts
import rateLimit from 'express-rate-limit';
// -------------------------------------------------------------
// 1. Limiter Geral da API
// Aplica-se à maioria das rotas, como listagem de imóveis, perfis, etc.
// -------------------------------------------------------------
export const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 100, // Limite de 100 pedidos por IP em 15 minutos
    standardHeaders: true, // Adiciona cabeçalhos RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-* (antigos)
    // Mensagem de erro personalizada
    handler: (req, res, next, options) => res.status(options.statusCode).json({
        error: options.message || 'Demasiados pedidos. Por favor, tente novamente mais tarde.'
    }),
    message: 'Demasiados pedidos enviados. Acesso limitado por 15 minutos.',
});
// -------------------------------------------------------------
// 2. Limiter Estrito para Autenticação
// Aplica-se às rotas de Login, Registo e Pedido de Senha.
// O limite é muito mais baixo para prevenir força bruta.
// -------------------------------------------------------------
export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // Janela de 5 minutos
    max: 5, // Apenas 5 pedidos por IP em 5 minutos
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => res.status(options.statusCode).json({
        error: options.message || 'Demasiadas tentativas de autenticação falharam. Tente novamente mais tarde.'
    }),
    message: 'Limitação de taxa aplicada. Tente novamente em 5 minutos.',
    // Crucial para rotas de login/registo:
    // Permite que o limite de taxa seja reiniciado se o utilizador for bem-sucedido.
    // Neste caso, não se aplica muito, já que queremos limitar as TENTATIVAS falhadas.
    // A chave de segurança é o MAX BAIXO.
});
