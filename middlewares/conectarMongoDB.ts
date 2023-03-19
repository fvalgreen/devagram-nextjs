import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import mongoose from 'mongoose';
import type {RespostaPadraoMsg} from '../types/RespostaPadraoMsg';


export const conectarMongoDB = (handler : NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    // verificar se o banco já está conectado, se estiver seguir para o endpoint ou próximo middleware
    if(mongoose.connections[0].readyState){
        return handler(req, res);
    }
    // Já que não está conectado, vamos conectar
    // obter a variável de ambiente preenchida do env

    const {DB_CONEXAO_STRING} = process.env;

    // Se a env estiver vazia aborta o uso do sistema e avisa ao programador
    if(!DB_CONEXAO_STRING){
        return res.status(500).json({erro: 'ENV de configuração do banco não informada'});
    }
    mongoose.connection.on('connected', () => console.log('Banco de dados conectado'));
    mongoose.connection.on('error', error => console.log('Ocorreu erro ao conectar no banco de dados'));
    await mongoose.connect(DB_CONEXAO_STRING); 

    // Agora posso seguir para meu endpoint, pois estou conectado no banco
    return handler(req, res);
}