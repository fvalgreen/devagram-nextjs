import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next"; // Request, Response e Handler padrão do Next
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import { UsuarioModel } from "@/models/UsuarioModel"; // Importando o model do Usuário
import { PublicacaoModel } from "@/models/PublicacaoModel"; // Importando o model da Publicação
import { SeguidorModel } from "@/models/SeguidorModel"; // Importando o model do Seguidor
import { validarTokenJWT } from "@/middlewares/validarTokenJWT"; // Importando o middleware de validação do token JWT criado
import { conectarMongoDB } from "@/middlewares/conectarMongoDB"; // Importando o middleware de conexão com DB que foi criado
import { politicaCORS } from "@/middlewares/politicaCORS"; // Importando o middleware de CORS que criamos
import { NotificacaoModel } from "@/models/NotificacaoModel";

const comentarioEndpoint = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg>
) => {
  try {
    if (req.method === "PUT") {
      // Verificando o método HTTP do request caso seja algo diferente de PUT retornará que o método não é válido

      const { userID, id } = req.query; // Pegamos na query da request o ID do usuário e da publicação
      const usuarioLogado = await UsuarioModel.findById(userID); // Com o ID do usuário em mãos vamos buscar na DB os dados dele através do findById

      if (!usuarioLogado) {
        // Caso não retorne nada da busca retorna um erro dizendo que não encontrou o usuário
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      const publicacao = await PublicacaoModel.findById(id); // Com o ID da publicação em mãos vamos buscar na DB os dados dela através do findById

      if (!publicacao) {
        // Caso não retorne nada da busca retorna um erro dizendo que não encontrou a publicação
        return res.status(400).json({ erro: "Publicação não encontrada" });
      }

      if (!req.body || !req.body.comentario || req.body.comentario.length < 2) {
        // Caso não exista corpo da requisição ou não exista o comentário no corpo ou se o comentário tiver menos de 2 caracteres retorna um erro de comentário inválido
        return res.status(400).json({ erro: "Comentário não é válido" });
      }

      const comentario = {
        // Criamos um objeto com o ID de quem comentou, o nome de quem comentou e o comentário em si
        usuarioId: usuarioLogado._id,
        nome: usuarioLogado.nome,
        comentario: req.body.comentario,
      };
      publicacao.comentarios.push(comentario); // Fazemos um push do objeto Comentário criado dentro da propriedade comentarios da publicação
      await PublicacaoModel.findByIdAndUpdate(
        { _id: publicacao._id },
        publicacao
      ); // Atualiza os dados da publicação através do findByIdAndUpdate

      // Colocar lógica para que o usuário não gere notificação para si mesmo

      const date = Date.now();

      const NotificacaoCriada = {
        usuarioAcao: userID,
        usuarioNotificado: publicacao.idUsuario,
        publicacao: publicacao._id,
        tipo: "comentário",
        dataNotificacao: moment(date).format(),
        visualizada: false,
      };

      await NotificacaoModel.create(NotificacaoCriada);

      return res.status(200).json({ msg: "Comentário adicionado com sucesso" }); // Retorna uma mensagem de sucesso
    }
    return res.status(405).json({ erro: "Método informado não é válido" });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ erro: "Ocorreu um erro ao comentar a publicação" });
  }
};

export default politicaCORS(
  validarTokenJWT(conectarMongoDB(comentarioEndpoint))
); // Exporta o endpoint de comentário passando pelos middlewares necessários
