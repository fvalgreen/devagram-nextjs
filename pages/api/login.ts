import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import md5 from "md5";
import { UsuarioModel } from "@/models/UsuarioModel";
import jwt from "jsonwebtoken";
import { LoginResposta } from "@/types/LoginResposta";

const endpointLogin = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | any>
) => {
  const { MINHA_CHAVE_JWT } = process.env;
  if (!MINHA_CHAVE_JWT) {
    return res.status(500).json({ erro: "ENV JWT não informada" });
  }

  if (req.method === "POST") {
    const { login, senha } = req.body;
    const usuariosEncontrados = await UsuarioModel.find({
      email: login,
      senha: md5(senha),
    });
    if (usuariosEncontrados && usuariosEncontrados.length > 0) {
      const usuarioEncontrado = usuariosEncontrados[0];

      const token = jwt.sign({ id: usuarioEncontrado._id }, MINHA_CHAVE_JWT);

      return res.status(200).json({
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        token,
      });
    }
    return res.status(405).json({ erro: "Usuário ou senha não encontrado" });
  }
  return res.status(405).json({ erro: "Metodo informado não é válido" });
};

export default conectarMongoDB(endpointLogin);
