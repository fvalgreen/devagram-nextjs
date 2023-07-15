import type { NextApiRequest, NextApiResponse } from "next"; // Request, Response e Handler padrão do Next
import { json } from "stream/consumers";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import { validarTokenJWT } from "@/middlewares/validarTokenJWT"; // Importando o middleware de validação do token JWT criado
import { conectarMongoDB } from "@/middlewares/conectarMongoDB"; // Importando o middleware de conexão com DB que foi criado
import { politicaCORS } from "@/middlewares/politicaCORS"; // Importando o middleware de CORS que criamos
import { PublicacaoModel } from "@/models/PublicacaoModel"; // Importando o model da Publicação
import {UsuarioModel} from "../../models/UsuarioModel"; // Importando o model do Usuário
import { SeguidorModel } from "@/models/SeguidorModel"; // Importando o model do Seguidor
import { NotificacaoModel } from "@/models/NotificacaoModel";

const seguirEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => { // Declaração padrão conforme os outros endpoints
    try {
       if(req.method === 'PUT'){ // Verifica se o método HTTP é PUT, caso não seja retorna um erro de método inválido
            
            const {userID, id} = req?.query; // Usando um destructor pega na query da request (caso exista) as propriedades userID(usuário que vai seguir) e id (Usuário a ser seguido)
            const usuarioLogado = await UsuarioModel.findById(userID); // Busca na DB o usuário que vai seguir pelo ID
            if(!usuarioLogado){ // Caso não retorne um usuário retorna um erro de usuário não encontrado
                return res.status(400).json({erro : 'Usuário Logado não encontrado'});
            }
            
            const usuarioASerSeguido = await UsuarioModel.findById(id); // Busca na DB o usuário que vai ser seguido pelo id  
            if(!usuarioASerSeguido){ // Caso não retorne um usuário retorna um erro de usuário não encontrado
                return res.status(400).json({erro: 'Usuário a ser seguido não encontrado'})
            }

            const jaESeguidor = await SeguidorModel.find({ // Procura na DB de seguidor se já há uma correspondência de seguidor e seguido conforme os id's
                usuarioId : usuarioLogado._id, 
                usuarioSeguidoId : usuarioASerSeguido._id
            });
            if(jaESeguidor && jaESeguidor.length > 0){ // Caso já seja seguidor faremos o processo de unfollow
                jaESeguidor.forEach(async (e : any) => await SeguidorModel.findByIdAndDelete({_id: e._id})); // Para cada correspondencia que retornou procura ele no DB e deleta as correspondências uma a uma
                usuarioLogado.seguindo--; // Diminui 1 do número de seguindo dos usuário logado
                usuarioASerSeguido.seguidores--; // Diminui 1 do número de seguidores do usuário a ser seguido
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado); // Atualiza o usuário logado na DB
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido); // Atualiza o usuário a ser desseguido na DB
                return res.status(200).json({msg: 'Usuário desseguido com sucesso'}); // Retorna uma mensagem de sucesso
            }else{ // Caso não haja correspondência e o usuário ainda não segue o usuário a ser seguido faremos o processo de seguir
                const seguidor = { // Cria um objeto seguidor conforme esperado no Model de seguidor
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                };
                await SeguidorModel.create(seguidor); // Cria na collection esse objeto
                usuarioLogado.seguindo++; // Adiciona 1 ao seguindo no usuário logado 
                usuarioASerSeguido.seguidores++; // Adiciona 1 ao seguidores no usuário a ser seguido
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado); // Atualiza o usuário logado na DB
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido); // Atualiza o usuário a ser seguido na DB

                const NotificacaoCriada = {
                    usuarioAcao: usuarioLogado._id,
                    usuarioNotificado: usuarioASerSeguido._id,
                    tipo: "seguir",
                    dataNotificacao: Date.now(),
                    visualizada: false
                }
    
                await NotificacaoModel.create(NotificacaoCriada);

                return res.status(200).json({msg: 'Usuário seguido com sucesso'}); // Retorna uma mensagem de sucesso
            };
       }
       return res.status(405).json({erro: 'Método informado não é válido'});


    } catch (e) {
        console.log(e);
        return res.status(500).json({erro: 'Não foi possível seguir/desseguir o usuário informado'});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(seguirEndpoint))); // Exporta o endpoint de seguir passando pelos middlewares necessários