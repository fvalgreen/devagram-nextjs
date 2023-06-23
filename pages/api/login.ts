import type { NextApiRequest, NextApiResponse } from "next"; // Request, Response e Handler padrão do Next
import md5 from "md5"; // Importando um criptografador simples para não transitar a senha do usuário sem criptografia
import jwt from "jsonwebtoken"; // Importando o JWT para geração do Token do usuário
import { conectarMongoDB } from "../../middlewares/conectarMongoDB"; // Importando o middleware de conexão com DB que foi criado
import { politicaCORS } from "@/middlewares/politicaCORS"; // Importando o middleware de CORS que criamos
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import { LoginResposta } from "@/types/LoginResposta"; // Importando o tipo de resposta padrão do Login que criamos
import { UsuarioModel } from "@/models/UsuarioModel"; // Importando o model do Usuário

const endpointLogin = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | any>
) => { // Declaração padrão conforme os outros endpoints
  const { MINHA_CHAVE_JWT } = process.env; // Usando um destructor pega a chave JWT nas variáveis de ambiente
  if (!MINHA_CHAVE_JWT) { // Caso não exista uma chave retorna um erro de chave não informada
    return res.status(500).json({ erro: "ENV JWT não informada" });
  }

  if (req.method === "POST") { // Verifica se o método HTTP é POST, caso não seja retorna um erro de método inválido
    const { login, senha } = req.body; // Usando um destructor pega as propriedades login e senha do corpo da requisição
    if(!login || !senha){
      return res.status(400).json({erro: "Login ou Senha não informado"})
    }
    const usuariosEncontrados = await UsuarioModel.find({ // Procura na base de dados o usuário passando um JSON com email(login) e senha. Criptografando a senha, para evitar de trafegar a senha do usuário sem criptografia
      email: login,
      senha: md5(senha),
    });
    if (usuariosEncontrados && usuariosEncontrados.length > 0) { // Caso a base de Dados retorne alguma coisa e o objeto retornado não seja vazio significa que o usuário foi encontrado e faremos a trativa de login
      const usuarioEncontrado = usuariosEncontrados[0]; // Pegamos o primeiro objeto retornado

      const token = jwt.sign({ id: usuarioEncontrado._id }, MINHA_CHAVE_JWT); // Geramos um Token JWT único para esse usuário

      return res.status(200).json({ // Retornamos um status de sucesso e o nome, email e token do usuário logado
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        token,
      });
    }
    return res.status(405).json({ erro: "Usuário ou senha não encontrado" }); // Caso a DB não retorne nada e/ou o retorno seja vazio um erro de usuário e senha não encontrado é retornado
  }
  return res.status(405).json({ erro: "Metodo informado não é válido" });
};

export default politicaCORS(conectarMongoDB(endpointLogin)); // Exporta o endpoint de like passando pelos middlewares necessários
