import type { NextApiRequest, NextApiResponse } from "next"; // Request, Response e Handler padrão do Next
import nc from "next-connect"; // Importando o Next Connect para facilitar a conexão HTTP
import md5 from "md5"; // Importando uma biblioteca de cripitografia simples para não manter a senha do usuário sem criptografia
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import type { CadastroRequisicao } from "../../types/CadastroRequisicao"; // Importando o tipo de requisição de cadastro padrão que criamos
import { conectarMongoDB } from "../../middlewares/conectarMongoDB"; // Importando o middleware de conexão com DB que foi criado
import { politicaCORS } from "@/middlewares/politicaCORS"; // Importando o middleware de CORS que criamos
import { UsuarioModel } from "../../models/UsuarioModel"; // Importando o model do Usuário
import { upload, uploadImagemCosmic } from "../../services/uploadImagemCosmic"; // Importando as funções que criamos para utilização do Cosmic e Mutler

const handler = nc() // Utilizando o nc do Next Connect que serve para "gerenciar" as requisições e resposta HTTP
  .use(upload.single("file")) // utiliza o Multer para fazer upload de um único arquivo
  .post(
    // Utiliza o método POST do NC
    async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
      try {
        // Trativa de erro, caso dê algum erro na tentativa o catch pegará esse erro e será possível tratar ele
        const usuario = req.body as CadastroRequisicao; // Criação do corpo da Request conforme o tipo padrão que criamos

        // Verificações de Nome, Email e Senha. Não é necessário a de imagem pois não é obrigatório

        if (!usuario.nome || usuario.nome.length < 2) {
          // Verifica se há nome e se ele tem um tamanho maior que 2, caso não atenda retorna erro de Nome inválido
          return res.status(400).json({ erro: "Nome inválido" });
        }

        if (
          // Verifica se o e-mail tem uma estrutura simples de email:
          // -Verifica se existe
          // -Verifica se tem mais que 5 caracteres
          // -Verifica se possui o @
          // -Verifica se tem um .
          !usuario.email ||
          usuario.email.length < 5 ||
          !usuario.email.includes("@") ||
          !usuario.email.includes(".")
        ) {
          return res.status(400).json({ erro: "Email inválido" }); // Retorna Email inválido caso qualquer uma das condições não sejam atendidas
        }
        if (!usuario.senha || usuario.senha.length < 4) {
          // Verifica o tamanho da senha caso não seja maior que 4 retorna um erro
          return res.status(400).json({ erro: "Senha inválida" });
        }

        // Verificando se já existe usuário com o mesmo email que foi informado no cadastro

        const usuarioComMesmoEmail = await UsuarioModel.find({
          // Método de pesquisa em um Model, é passado os parâmetros e é retornado um objeto que contenha o que foi passado
          email: usuario.email, // Passando um JSON com o usuário do cadastro
        });
        if (usuarioComMesmoEmail && usuarioComMesmoEmail.length > 0) {
          // Caso a pesquisa retorne algo e esse retorno tenha um tamanho maior que 0 retorna um erro de que já existe um cadastro com esse email
          return res
            .status(400)
            .json({ erro: "Esse email já está cadastrado" });
        }
        // enviar a imagem do multer para o cosmic
        const image = await uploadImagemCosmic(req); 

        // salvar no banco de dados
        const usuarioASerSalvo = { // Cria uma const com o que é esperado de um usuario e isso foi definido no Model
          nome: usuario.nome,
          email: usuario.email,
          senha: md5(usuario.senha), // Utilização do md5 para que o dado seja guardado criptografado, caso haja algum vazamento a senha ao menos estará com uma criptografia
          avatar: image?.media?.url, // Caso exista uma imagem ela será mandada para o avatar do usuário
        };

        await UsuarioModel.create(usuarioASerSalvo); // O método create cria o objeto definido em usuarioASerSalvo na Coleção
        return res.status(200).json({ msg: "Usuário cadastrado com sucesso" });
      } catch (e) {
        console.log(e);
        return res.status(500).json({ erro: "erro ao cadastrar o usuário" });
      }
    }
  );
export const config = { // Configurando para que o NEXT não mande uma request com um JSON, por estarmos enviando uma foto é necessário que seja um FormData
  api: {
    bodyParser: false,
  },
};
export default politicaCORS(conectarMongoDB(handler)); // Export o handler criado passando os middlewares necessários antes
