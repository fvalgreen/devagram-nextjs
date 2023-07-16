import moment from "moment";
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

    const notificacoesSeteDias: any[] = [];
    const notificacoesTrintaDias: any[] = [];

    notificacoesVisualizadas.map(async (notificacao: any) => {
      const seteDias = moment(moment().subtract(7, "days")).toISOString();
      const trintaDias = moment(moment().subtract(30, "days")).toISOString();
      const notificacaoData = moment(notificacao.dataNotificacao).format();
      const date = moment(notificacaoData).diff(seteDias);
      if (moment(notificacaoData).diff(seteDias) > 0) {
        notificacoesSeteDias.push(notificacao);
      } else {
        if (moment(notificacaoData).diff(trintaDias) > 0) {
          notificacoesTrintaDias.push(notificacao);
        }else {
          await NotificacaoModel.findByIdAndDelete({_id: notificacao._id}) // Apagando a notificaçao do Banco de Dados após 30 dias para não popular a DB
        }
      }
    });

    const retorno = {
      novas: notificacoesNovas,
      ultimosSeteDias: notificacoesSeteDias,
      ultimosTrintaDias: notificacoesTrintaDias,
    };

    return res.status(200).json(retorno);
  } else if (req.method === "PUT") {
    const { userID } = req.query;

    const notificacoes = await NotificacaoModel.find({
      usuarioNotificado: userID,
    });

    console.log(notificacoes);
    notificacoes.map(async (notificacao: any) => {
      if (notificacao.visualizada == false) {
        notificacao.visualizada = true;
        await NotificacaoModel.findByIdAndUpdate(
          { _id: notificacao._id },
          notificacao
        );
      }
    });

    return res.status(200).json({ msg: "Notificacóes visualizadas" });
  } else {
    return res.status(405).json({ msg: "Método inválido" });
  }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(notificacoes)));
