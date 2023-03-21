import type { NextApiRequest, NextApiResponse } from "next";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { UsuarioModel } from "@/models/UsuarioModel";

const usuarioEndPoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const {userID} = req?.query;
      const usuario = await UsuarioModel.findById(userID);
      usuario.senha = null;
      return res.status(200).json(usuario);

    } catch (e) {
      console.log(e);
      return res.status(400).json({erro: 'Não foi possível obter dados do usuário'})
    }
  
 

};

export default validarTokenJWT(conectarMongoDB(usuarioEndPoint));
