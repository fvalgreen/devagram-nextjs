import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next"; // Request, Response e Handler padrão do Next
import { politicaCORS } from "@/middlewares/politicaCORS"; // Importando o middleware de CORS que criamos
import { validarTokenJWT } from "@/middlewares/validarTokenJWT"; // Importando o middleware de validação do token JWT criado
import { conectarMongoDB } from "@/middlewares/conectarMongoDB"; // Importando o middleware de conexão com DB que foi criado
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import { PublicacaoModel } from "@/models/PublicacaoModel"; // Importando o model da Publicação
import { UsuarioModel } from "../../models/UsuarioModel"; // Importando o model do Usuário
import { NotificacaoModel } from "@/models/NotificacaoModel";

const likeEndpoint = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg>
) => {
  // Declaração padrão conforme os outros endpoints
  try {
    if (req.method === "PUT") {
      // Verifica se o método HTTP é o PUT caso seja diferente retorna um erro de Método inválido
      // Id da publicação
      const { id } = req?.query; // Usando um destructor cria uma constante id com a propriedade id que vem no query da request se a request existe
      const publicacao = await PublicacaoModel.findById(id); // Busca no Banco de Dados a publicação pelo ID
      if (!publicacao) {
        // Caso não exista a publicação retorna um erro de publicação não encontrada
        return res.status(400).json({ erro: "Publicação não encontrada" });
      }

      // ID do usuário que está curtindo a publicação
      const { userID } = req?.query; // Usando um destructor cria uma constante userID com a propriedade userID que vem no query da request se a request existe
      const usuario = await UsuarioModel.findById(userID); // Busca no Banco de Dados o usuário que está curtindo pelo ID
      usuario.senha = null; // Definimos usuario.senha como null para a senha do usuário não ficar trafegando, pois quando fazemos a pesquisa pelo ID do usuário a DB retorna todos os dados existentes na coleção referente aquele usuário

      if (!usuario) {
        // Caso a DB não retorne um usuário um erro de usuário não encontrado é retornado
        return res.status(400).json({ erro: "Usuário não encontrada" });
      }
      const indexDoUsuarioNoLike = publicacao.likes.findIndex(
        (e: any) => e.toString() === usuario._id.toString()
      ); // Verificamos dentro do Array likes da publicação se já existe o ID do usuário nela. A verificação retornará um index onde o id do usuário está ou retornará -1 caso não exista o id do usuário no Array

      if (indexDoUsuarioNoLike != -1) {
        // Caso a verificação pelo index retorne algo diferente de -1 significa que o id do usuário já está no Array de likes e o usuário já havia curtido essa publicação, então a ação é para descurtir a publicação
        publicacao.likes.splice(indexDoUsuarioNoLike, 1); // Usamos o splice para retirar um item do Array no index onde está o id do usuário
        await PublicacaoModel.findByIdAndUpdate(
          { _id: publicacao._id },
          publicacao
        ); // Atualizamos a publicação no banco de dados
        return res
          .status(200)
          .json({ msg: "Publicação descurtida com sucesso" }); // Retorna uma msg de publicação descurtida
      } else {
        publicacao.likes.push(usuario._id); // Caso a verificação retorne -1 significa que não foi encontrado o id do usuário no Array daí usamos o método push para adicionar o id do usuário no fim do Array likes
        await PublicacaoModel.findByIdAndUpdate(
          { _id: publicacao._id },
          publicacao
        ); // Atualizamos a publicação no banco de dados

        const date = Date.now();
        const NotificacaoCriada = {
          usuarioAcao: userID,
          usuarioNotificado: publicacao.idUsuario,
          publicacao: publicacao._id,
          tipo: "curtida",
          dataNotificacao: moment(date).format(),
          visualizada: false,
        };

        await NotificacaoModel.create(NotificacaoCriada);

        return res.status(200).json({ msg: "Publicação curtida com sucesso" }); // Retorna uma msg de publicação curtida
      }
    }

    return res.status(405).json({ erro: "Método informado inválido" });
  } catch (e) {
    // Caso algum erro seja detectado na aplicação é informado no console e retorna uma mensagem de erro
    console.log(e);
    return res
      .status(500)
      .json({ erro: "Não foi possível curtir a publicação" });
  }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(likeEndpoint))); // Exporta o endpoint de like passando pelos middlewares necessários
