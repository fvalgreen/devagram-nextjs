import type { NextApiRequest, NextApiResponse } from "next";
import { upload, uploadImagemCosmic } from "@/services/uploadImagemCosmic";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import nc from "next-connect";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";


const handler = 
    nc()
    .use(upload.single("file"))
    .post(async (req : any, res: NextApiResponse<RespostaPadraoMsg>) => {

        try {

            if(!req || !req.body){
                return res.status(400).json({erro: 'Parametros de entrada inválidos'})
            }
            const {descricao} = req?.body;

            if(!descricao || descricao.length < 2){
                
            }
            if(!req.file){
                return res.status(400).json({erro: 'Imagem é obrigatória'});
            }

            return res.status(200).json({msg: 'Postagem válida'});
        } catch (e) {
            console.log(e);
            return res.status(400).json({erro: 'Erro ao cadastrar publicação'});
        }        
});

export const config = {
    api : {
        bodyParser : false
    }
};

export default validarTokenJWT(conectarMongoDB(handler));