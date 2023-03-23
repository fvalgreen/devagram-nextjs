import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { PublicacaoModel } from "@/models/PublicacaoModel";
import {UsuarioModel} from "../../models/UsuarioModel"
import { politicaCORS } from "@/middlewares/politicaCORS";

const likeEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        if(req.method === 'PUT'){
            // Id da publicação
            const {id} = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            if(!publicacao){
                return res.status(400).json({erro: 'Publicação não encontrada'})
            }

            // ID do usuário que está curtindo a publicação
            const {userID} = req?.query;
            const usuario = await UsuarioModel.findById(userID);
            usuario.senha = null;
            
            if(!usuario){
                return res.status(400).json({erro: 'Usuário não encontrada'})
            }
            const indexDoUsuarioNoLike = publicacao.likes.findIndex((e : any) => e.toString() === usuario._id.toString());
            
            if(indexDoUsuarioNoLike != -1){
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
                await PublicacaoModel.findByIdAndUpdate({_id: publicacao._id}, publicacao)
                return res.status(200).json({msg: 'Publicação descurtida com sucesso'})
            }else{
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({_id: publicacao._id}, publicacao);
                return res.status(200).json({msg: 'Publicação curtida com sucesso'})
            }

        }

        return res.status(405).json({erro: 'Método informado inválido'});
    } catch (e) {
        console.log(e);
        return res.status(500).json({erro: 'Não foi possível curtir a publicação'})        
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(likeEndpoint)));