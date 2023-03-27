import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next"; // Request, Response e Handler padrão do Next
import { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import jwt, { JwtPayload } from "jsonwebtoken"; // Importando o JWT e o JWT payload do pacote JWT

export const validarTokenJWT = (handler: NextApiHandler) => (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {

    try{
        const {MINHA_CHAVE_JWT} = process.env; // Pega nas variáveis de ambiente a chave JWT definida
        if(!MINHA_CHAVE_JWT){ // Caso não exista a chave JWT dá um return informando que não foi informada a chave
            return res.status(500).json({erro: 'ENV chave JWT não informada'})
        }

        if(!req || !req.headers){ // Caso não haja o request ou o cabeçalho do request retorna um erro de que não foi possível validar o token
            return res.status(401).json({erro: 'Não foi possível validar o token de acesso'});
        }

        if(req.method !== 'OPTIONS'){ // Caso o método seja diferente de OPTIONS seguimos para a verificação do Token.
            const authorization = req.headers['authorization']; // Pega no cabeçalho do request a authorization
            if(!authorization){ // Caso não haja authorization retorna um erro de que não foi possível validar o token
                return res.status(401).json({erro: 'Não foi possível validar o token de acesso'});
            }
            const token = authorization.substring(7); // A authorization no cabeçalho vem no formato "bearer token" a substring coloca na variável token o authorization a partir da posição 7 da String
            if(!token){ // Caso não haja token retorna um erro de que não foi possível validar o token
                return res.status(401).json({erro: 'Não foi possível validaar o token de acesso'});
            }
            const decoded = jwt.verify(token, MINHA_CHAVE_JWT) as JwtPayload; // Faz uma verificação do token JWT com a sua chave JWT
            

            if(!decoded){ // Caso o decoded retorne false retorna um erro de que não foi possível validar o token
                return res.status(401).json({erro: 'Não foi possível validar o token de acesso'});
            }
            if(!req.query){ // Caso não exista query no request cria uma query vazia
                req.query = {};
            }

            req.query.userID = decoded.id;} // devolve o id do decoded como o userID do query da request
    }catch(e){ // Caso dê algum erro retorna um erro de que não foi possível validar o token
        console.log(e);
        return res.status(401).json({erro: 'Não foi possível validar o token de acesso'});
    }  

    
    return handler(req, res); // Caso tudo tenha dado certo retorna o manipulador com a request e response
}