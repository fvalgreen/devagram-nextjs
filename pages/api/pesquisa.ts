import type { NextApiRequest, NextApiResponse  } from "next";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { UsuarioModel } from "@/models/UsuarioModel";
import { politicaCORS } from "@/middlewares/politicaCORS";


const pesquisaEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {
    try {
        if(req.method === "GET"){
            if(req?.query?.id){
                const usuariosEncontrado = await UsuarioModel.findById(req?.query?.id);
                usuariosEncontrado.senha = null;
                if(!usuariosEncontrado){
                    return res.status(400).json({erro: 'Usuário não encontrado'})
                }
                return res.status(200).json(usuariosEncontrado);
            }else{
                const {filtro} = req.query;

                if(!filtro || filtro.length < 2){
                    return res.status(400).json({erro: 'Favor informar pelo menos 2 caracteres para a busca'})
                }

                const usuariosEncontrados = await UsuarioModel.find({ 
                    $or: [
                        {nome : {$regex : filtro, $options: 'i'}}, 
                        {email : {$regex : filtro, $options: 'i'}}
                    ]
                    
                });

                return res.status(200).json(usuariosEncontrados) ;
            }


            

        }
        
    } catch (e) {
        console.log(e);
        return res.status(500).json({erro: 'Não foi possível buscar usuários: ' + e})
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint)));