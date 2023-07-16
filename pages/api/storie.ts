import type { NextApiRequest, NextApiResponse } from "next";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { politicaCORS } from "@/middlewares/politicaCORS";
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg";
import nc from "next-connect";
import { UsuarioModel } from "@/models/UsuarioModel";
import { upload, uploadImagemCosmic } from "@/services/uploadImagemCosmic";
import { StoriesModel } from "@/models/StoriesModel";
import moment from "moment";
import { SeguidorModel } from "@/models/SeguidorModel";

const handler = nc()
  .use(upload.single("file"))
  .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { userID } = req.query;

      const usuario = await UsuarioModel.findById(userID);

      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      if (!req || !req.body) {
        return res
          .status(400)
          .json({ erro: "Parametros de entrada inválidos" });
      }

      if (!req.file || !req.file.originalname) {
        return res.status(400).json({ erro: "Imagem é obrigatória" });
      }

      const image = await uploadImagemCosmic(req);
      const date = new Date();
      const storie = {
        idUsuario: usuario._id,
        foto: image.media.url,
        data: moment(date).format(),
      };

      await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

      await StoriesModel.create(storie);

      return res.status(200).json({ msg: "Storie criado com sucesso" });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ erro: "Erro ao cadastrar o storie" });
    }
  })
  .get(
    async (
      req: NextApiRequest,
      res: NextApiResponse<RespostaPadraoMsg | any>
    ) => {
      if (req?.query?.id) {
        const stories = await StoriesModel.find({
          idUsuario: req.query.id,
        }).sort({ data: -1 });

        var storiesAtuais: any = [];

        stories.map(async (storie: any, index: number) => {
          const umDia = moment(moment().subtract(1, "days")).toISOString();
          const storieData = moment(storie.data).format();
          const date = moment(storieData).diff(umDia);
          if (date < 0) {
            await StoriesModel.findOneAndDelete({ _id: storie._id }); // Apagando stories que tenham mais de 7 dias para não ocupar muito o bucket
          } else {
            storiesAtuais.push(storie);
          }
        });        

        return res.status(200).json(storiesAtuais);
      } else {
        const { userID } = req.query;
        const usuarioLogado = await UsuarioModel.findById(userID);
        if (!usuarioLogado) {
          return res.status(400).json({ erro: "Usuário não encontrado" });
        }
        const seguidos = await SeguidorModel.find({
          usuarioId: usuarioLogado._id,
        });
        const seguidosIds = seguidos.map((s) => s.usuarioSeguidoId);

        const stories = await StoriesModel.find({
          $or: [{ idUsuario: usuarioLogado._id }, { idUsuario: seguidosIds }],
        }).sort({ data: -1 });

        var storiesAtuais: any = [];

        stories.map(async (storie: any, index: number) => {
          const umDia = moment(moment().subtract(1, "days")).toISOString();
          const storieData = moment(storie.data).format();
          const date = moment(storieData).diff(umDia);
          if (date < 0) {
            await StoriesModel.findOneAndDelete({ _id: storie._id }); // Apagando stories que tenham mais de 7 dias para não ocupar muito o bucket
          } else {
            storiesAtuais.push(storie);
          }
        });
        const result = [];
        for (const storie of storiesAtuais) {
          const usuarioDoStorie = await UsuarioModel.findById(storie.idUsuario);
          if (usuarioDoStorie) {
            const final = {
              ...storie._doc,
              usuario: {
                nome: usuarioDoStorie.nome,
                avatar: usuarioDoStorie.avatar,
              },
            };
            result.push(final);
          }
        }

        return res.status(200).json(result);
      }
    }
  );

export const config = {
  api: {
    bodyParser: false,
  },
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(handler)));
