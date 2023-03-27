import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next'; // Request, Response e Handler padrão do Next
import type { RespostaPadraoMsg } from '@/types/RespostaPadraoMsg'; // Importando o tipo de resposta padrão que criamos
import NextCors from 'nextjs-cors'; // Importando o CORS do Next

// CORS = Cross-Origin Resource Sharing
// Define de quais origens nossa API aceitará request

export const politicaCORS =  (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        await NextCors(req, res, { // Utilizando o CORS do Nextjs
            origin: '*', // Aqui em projetos reais que precisem de segurança é definido as origens aceitas pelo back-end, nesse caso colocamos como qualquer uma
            methods: ['POST', 'PUT', 'GET'], // Define os métodos aceitos pelo Back-end
            optionsSuccessStatus: 200, // O status de retorno
        });
        return handler(req, res); // Caso não haja erro retorna a request e response normalmente
    } catch (e) {
        console.log('Erro ao tratar a política de CORS', e); // Tratamento do erro
        return res.status(500).json({erro: 'Erro ao tratar política de CORS'})
    }
}