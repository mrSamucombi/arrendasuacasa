// api/upload.routes.ts

import { Router, Request, Response } from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';
import { checkAuth } from '../middleware/auth.middleware.js';
import path from 'path';


const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10 MB
});

router.post('/', checkAuth, upload.single('file'), async (req: Request, res: Response) => {
    
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
    }
    
    try {
        const rawFileTypes = ['application/pdf'];
        const resourceType = rawFileTypes.includes(req.file.mimetype) ? 'raw' : 'image';
        const filename = `${path.parse(req.file.originalname).name}_${Date.now()}`;

        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: `arrendasuacasa/${req.user.uid}`,
                    resource_type: resourceType,
                    public_id: filename
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        const result = uploadResponse as any;
        let finalUrl = result.secure_url;

        if (resourceType === 'raw') {
            finalUrl = cloudinary.url(result.public_id, {
                resource_type: 'raw',
                flags: [`attachment:${req.file.originalname.replace(/\s+/g, '_')}`]
            });
        }
        
        res.status(200).json({ url: finalUrl });
    } catch (error) {
        console.error("Erro no upload para o Cloudinary:", error);
        if (error instanceof Error) {
            return res.status(500).json({ error: 'Falha no upload do ficheiro.', details: error.message });
        }
        res.status(500).json({ error: 'Ocorreu um erro desconhecido durante o upload.' });
    }
});

export default router;