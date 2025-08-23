import { Router, Request, Response } from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';
import { checkAuth } from '../middleware/auth.middleware.js';
import path from 'path';

const router = Router();

// Configura o Multer para usar armazenamento em memória.
// Isto é eficiente porque não precisamos de guardar o ficheiro no disco do servidor.
const storage = multer.memoryStorage();

// Limites para o upload para evitar ficheiros muito grandes
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10 MB por ficheiro
  fileFilter: (req, file, cb) => {
    // Filtro para aceitar apenas os tipos de ficheiro esperados
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Tipo de ficheiro não suportado. Apenas imagens (jpg, png) e PDF são permitidos.'));
  }
});

router.post('/', checkAuth, upload.single('file'), async (req: Request, res: Response) => {
    // ========================================================================
    // VERIFICAÇÕES DE SEGURANÇA (Guards)
    // Estas verificações garantem ao TypeScript que 'req.user' e 'req.file'
    // existem no resto da função.
    // ========================================================================
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado. O token de utilizador em falta.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum ficheiro foi enviado.' });
    }
    
    try {
        const rawFileTypes = ['application/pdf'];
        const resourceType = rawFileTypes.includes(req.file.mimetype) ? 'raw' : 'image';
        
        // Cria um nome de ficheiro único para evitar sobreposições
        const filename = `${path.parse(req.file.originalname).name}_${Date.now()}`;

        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: `arrendasuacasa/${req.user.uid}`, // Agora é seguro aceder a req.user.uid
                    resource_type: resourceType,
                    public_id: filename
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(req.file.buffer); // Agora é seguro aceder a req.file.buffer
        });

        const result = uploadResponse as any;
        let finalUrl = result.secure_url;

        if (resourceType === 'raw') {
            finalUrl = cloudinary.url(result.public_id, {
                resource_type: 'raw',
                // Força o download com o nome original limpo
                flags: [`attachment:${req.file.originalname.replace(/\s+/g, '_')}`]
            });
        }
        
        console.log(`[Upload] Ficheiro recebido: ${req.file.originalname}, Tipo: ${resourceType}, URL Final Gerado: ${finalUrl}`);
        res.status(200).json({ url: finalUrl });

    } catch (error) {
        console.error("Erro no upload para o Cloudinary:", error);
        
        // Envia uma resposta de erro mais informativa
        if (error instanceof Error) {
            return res.status(500).json({ error: 'Falha no upload do ficheiro.', details: error.message });
        }
        res.status(500).json({ error: 'Ocorreu um erro desconhecido durante o upload.' });
    }
});

export default router;