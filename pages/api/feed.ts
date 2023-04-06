import type { NextApiRequest, NextApiResponse } from "next"; // Request, Response e Handler padrão do Next
import { validarTokenJWT } from "@/middlewares/validarTokenJWT"; // Importando o middleware de validação do token JWT criado
import { conectarMongoDB } from "@/middlewares/conectarMongoDB"; // Importando o middleware de conexão com DB que foi criado
import { politicaCORS } from "@/middlewares/politicaCORS"; // Importando o middleware de CORS que criamos
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import { UsuarioModel } from "@/models/UsuarioModel"; // Importando o model do Usuário
import { PublicacaoModel } from "@/models/PublicacaoModel"; // Importando o model da Publicação
import { SeguidorModel } from "@/models/SeguidorModel"; // Importando o model do Seguidor

const feedEndPoint = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | any>
) => {
  try {
    if (req.method === "GET") {
      // Verificando o método HTTP do request caso seja algo diferente de GET retornará que o método não é válido

      if (req?.query?.id) {
        // Verifica na query se passamos algum ID para mostrarmos o Feed de um usuário específico
        const usuario = await UsuarioModel.findById(req.query.id); // Procura na DB o usuário passado pelo ID
        if (!usuario) {
          // Caso não exista usuário com esse ID retorna um erro de usuário não encontrado
          return res.status(400).json({ erro: "Usuário não encontrado" });
        }
        // Caso exista o usuário o feed dele é tratado

        const publicacoes = await PublicacaoModel.find({
          idUsuario: usuario._id,
        }).sort({ data: -1 }); // Busca na DB todas as publicações que contenham o ID do usuário passado ordenando decrescente de data
        return res.status(200).json(publicacoes); // Retorna um JSON com todas as publicações do usuário solicitado
      } else {
        // Caso não seja passado ID nenhum será exibido as publicações de quem o usuário segue
        const { userID } = req.query; // Utiliza um destructor para pegar um campo "userID" da query do request
        const usuarioLogado = await UsuarioModel.findById(userID); // Buscar na DB esse usuário pelo ID
        if (!usuarioLogado) {
          // Caso a busca não retorne um usuário é retornado um erro de usuário não encontrado
          return res.status(400).json({ erro: "Usuário não encontrado" });
        }
        const seguidos = await SeguidorModel.find({
          usuarioId: usuarioLogado._id,
        }); // Busca na Coleção de seguidos todas as correspondencias de quem o usuário está seguindo
        const seguidosIds = seguidos.map((s) => s.usuarioSeguidoId); // Nós pegamos os IDs de todos os seguidos pelo usuário usando um map que vai criar um array apenas com os "usuarioSeguidoId" dos seguidos que retornou da DB

        const publicacoes = await PublicacaoModel.find({
          // Realiza uma busca de publicações no banco de dados
          $or: [
            // O or é usado para passar mais parametros de pesquisa
            { idUsuario: usuarioLogado._id }, // Busca as publicações do usuario logado
            { idUsuario: seguidosIds }, // Busca as publicações de quem o usuário segue
          ],
        }).sort({ data: -1 }); // Ordena as publicações em ordem decrescente de data

        const result = []; // Cria um Array vazio para colocar o resultado

        // A consulta pelas publicações retornará um array com todas as publicações correspondentes a pesquisa, sendo cada uma delas um JSON

        for (const publicacao of publicacoes) {
          // Para cada elemento dentro de publicacoes
          const usuarioDaPublicacao = await UsuarioModel.findById(
            publicacao.idUsuario
          ); // Buscamos na DB qual o usuário fez a publicação pelo ID dele
          if (usuarioDaPublicacao) {
            // Caso retorne um usuário nós criaremos um objeto para armazenar a publicação com o usuário que a criou
            const final = {
              ...publicacao._doc, // Pega cada par chave-valor que está em publicacao._doc e armazena no JSON
              usuario: { // Guarda os dados do usuário
                nome: usuarioDaPublicacao.nome,
                avatar: usuarioDaPublicacao.avatar,
              },
            };
            result.push(final); // Realiza um push no result colocando todas as publicações formatadas no array
          }
        }

        return res.status(200).json(result); // Retorna o Array criado com todas as publicações
      }
    }
    return res.status(405).json({ erro: "Método informado não é válido" });
  } catch (e) {
    console.log(e);
  }
  return res.status(400).json({ erro: "Não foi possível obter o feed" });
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(feedEndPoint))); // Exporta o endpoint de feed passando pelos middlewares necessários
