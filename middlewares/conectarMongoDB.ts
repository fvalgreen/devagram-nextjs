import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next'; // Request, Response e Handler padrão do Next
import mongoose from 'mongoose'; // Importando o mongoose
import type {RespostaPadraoMsg} from '../types/RespostaPadraoMsg'; // Importando o tipo de resposta padrão que criamos


export const conectarMongoDB = (handler : NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    // verificar se o banco já está conectado, se estiver seguir para o endpoint ou próximo middleware
    if(mongoose.connections[0].readyState){ // verifica se o primeiro item do array connections está pronto
        return handler(req, res); // Estando pronto vamos retornar o manipular com a requeste e response
    }
    // Já que não está conectado, vamos conectar
    // obter a variável de ambiente preenchida do env

    const {DB_CONEXAO_STRING} = process.env; // Pega nas variáveis de ambiente nossa string de conexão com o DB

    // Se a env estiver vazia aborta o uso do sistema e avisa ao programador
    if(!DB_CONEXAO_STRING){
        return res.status(500).json({erro: 'ENV de configuração do banco não informada'});
    }
    mongoose.connection.on('connected', () => console.log('Banco de dados conectado')); // Resposta caso o mongoose tenha se conectado ao banco de dados corretamente
    mongoose.connection.on('error', error => console.log('Ocorreu erro ao conectar no banco de dados')); // Resposta caso o mongoose tenha encontrado um erro ao se conectado ao banco de dados
    await mongoose.connect(DB_CONEXAO_STRING); // Conecta ao banco de Dados

    // Agora posso seguir para meu endpoint, pois estou conectado no banco
    return handler(req, res);
}