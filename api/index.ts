import { Router } from 'express';
import authRouter from './auth.routes.js';
import propertiesRouter from './properties.routes.js';
import packagesRouter from './packages.routes.js';
import ownerRouter from './owner.routes.js';
import clientRouter from './client.routes.js';
import purchaseRouter from './purchase.routes.js';
import adminRouter from './admin.routes.js';
import uploadRouter from './upload.routes.js';
import messagesRouter from './messages.routes.js';
import userRouter from './user.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/properties', propertiesRouter);
router.use('/packages', packagesRouter);
router.use('/owners', ownerRouter);
router.use('/upload', uploadRouter);
router.use('/clients', clientRouter);
router.use('/purchases', purchaseRouter);
router.use('/admin', adminRouter);
router.use('/messages', messagesRouter);
router.use('/users', userRouter);

export default router;