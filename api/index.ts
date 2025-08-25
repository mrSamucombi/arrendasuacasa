// api/index.ts (VERSÃO FINAL E GARANTIDA)

import { Router } from 'express';

// Importação de todos os seus ficheiros de rotas
import authRoutes from './auth.routes.js';
import propertyRoutes from './properties.routes.js';
import purchaseRoutes from './purchase.routes.js';
import uploadRoutes from './upload.routes.js';
import clientRoutes from './client.routes.js';
import ownerRoutes from './owner.routes.js';
import adminRoutes from './admin.routes.js';
import messagesRoutes from './messages.routes.js';
import packagesRoutes from './packages.routes.js';

const router = Router();

// --- Ligação de todas as rotas aos seus caminhos base ---
// Esta secção funciona como a "receção" da sua API.

router.use('/auth', authRoutes); // <-- A LINHA MAIS IMPORTANTE PARA O SEU ERRO
router.use('/properties', propertyRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/upload', uploadRoutes);
router.use('/clients', clientRoutes);
router.use('/owners', ownerRoutes);
router.use('/admin', adminRoutes);
router.use('/messages', messagesRoutes);
router.use('/packages', packagesRoutes);

export default router;