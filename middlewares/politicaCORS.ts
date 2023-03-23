import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import type { RespostaPadraoMsg } from '@/types/RespostaPadraoMsg';
import NextCors from 'nextjs-cors';

export const politicaCORS =  (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        await NextCors(req, res, {
            origin: '*',
            methods: ['POST', 'PUT', 'GET'],
            optionsSuccessStatus: 200,
        });
        return handler(req, res);
    } catch (e) {
        console.log('Erro ao tratar a política de CORS', e);
        return res.status(500).json({erro: 'Erro ao tratar política de CORS'})
    }
}