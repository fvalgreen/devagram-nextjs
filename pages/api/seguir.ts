import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { PublicacaoModel } from "@/models/PublicacaoModel";
import {UsuarioModel} from "../../models/UsuarioModel"
import { json } from "stream/consumers";
import { SeguidorModel } from "@/models/SeguidorModel";
import { politicaCORS } from "@/middlewares/politicaCORS";

const seguirEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
       if(req.method === 'PUT'){
            
            const {userID, id} = req?.query;
            const usuarioLogado = await UsuarioModel.findById(userID);           
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuário Logado não encontrado'});
            }
            
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!usuarioASerSeguido){
                return res.status(400).json({erro: 'Usuário a ser seguido não encontrado'})
            }

            const jaESeguidor = await SeguidorModel.find({usuarioId : usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id});
            if(jaESeguidor && jaESeguidor.length > 0){
                jaESeguidor.forEach(async (e : any) => await SeguidorModel.findByIdAndDelete({_id: e._id}));
                usuarioLogado.seguindo--;
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido);
                return res.status(200).json({msg: 'Usuário desseguido com sucesso'});
            }else{
                const seguidor = {usuarioId : usuarioLogado._id,
                     usuarioSeguidoId : usuarioASerSeguido._id};
                await SeguidorModel.create(seguidor);
                usuarioLogado.seguindo++;
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioLogado._id}, usuarioLogado);
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido);
                return res.status(200).json({msg: 'Usuário seguido com sucesso'});
            };
       }
       return res.status(405).json({erro: 'Método informado não é válido'});


    } catch (e) {
        console.log(e);
        return res.status(500).json({erro: 'Não foi possível seguir/desseguir o usuário informado'});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(seguirEndpoint)));