import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { politicaCORS } from "@/middlewares/politicaCORS";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { NotificacaoModel } from "@/models/NotificacaoModel";
import { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import { NextApiRequest, NextApiResponse } from "next";

const notificacoes = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | any>
) => {
  if (req.method === "GET") {
    const { userID } = req.query;

    const notificacoes = await NotificacaoModel.find({
      usuarioNotificado: userID,
    });

    const notificacoesNovas: any[] = [];
    const notificacoesVisualizadas: any[] = [];

    notificacoes.map((notificacao: any) => {
      if (notificacao.visualizada == true) {
        notificacoesVisualizadas.push(notificacao);
      } else {
        notificacoesNovas.push(notificacao);
      }
    });

    const retorno = {
      novas: notificacoesNovas,
      visualizadas: notificacoesVisualizadas,
    };

    return res.status(200).json(retorno);
  } else if (req.method === "PUT") {
    const { userID } = req.query;

    const notificacoes = await NotificacaoModel.find({
      usuarioNotificado: userID,
    });

    console.log(notificacoes)
    notificacoes.map(async (notificacao: any) => {
      if (notificacao.visualizada == false) {
        notificacao.visualizada = true;
        await NotificacaoModel.findByIdAndUpdate({_id: notificacao._id}, notificacao)
      }
    });


    return res.status(200).json({ msg: "Notificacóes visualizadas" });
  } else {
    return res.status(405).json({ msg: "Método inválido" });
  }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(notificacoes)));
