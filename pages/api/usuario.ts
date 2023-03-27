import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";  // Request, Response e Handler padrão do Next
import { validarTokenJWT } from "@/middlewares/validarTokenJWT"; // Importando o middleware de validação do token JWT criado
import { conectarMongoDB } from "@/middlewares/conectarMongoDB"; // Importando o middleware de conexão com DB que foi criado
import { politicaCORS } from "@/middlewares/politicaCORS"; // Importando o middleware de CORS que criamos
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import { UsuarioModel } from "@/models/UsuarioModel"; // Importando o model do Usuário
import { upload, uploadImagemCosmic } from "@/services/uploadImagemCosmic"; // Importando as funções que criamos para utilização do Cosmic e Mutler

const handler = nc() // Utilizando o nc do Next Connect que serve para "gerenciar" as requisições e resposta HTTP
.use(upload.single('file')) // utiliza o Multer para fazer upload de um único arquivo
.put( // Utiliza o método PUT do NC para atualizar os dados do usuário
  async (req: any, res: NextApiResponse<RespostaPadraoMsg>) =>{
  try {
    const {userID} = req?.query;  // Usando um destructor cria uma constante userID com a propriedade userID que vem no query da request se a request existe
    const usuario = await UsuarioModel.findById(userID); // Busca no Banco de Dados o usuário pelo id

    if(!usuario){ // Caso a busca não retorne um usuário retorna um erro de usuário não encontrado
      return res.status(400).json({erro: 'Usuário não encontrado'})
    };

    const {nome} = req.body; // Usando um destructor cria uma constante nome com a propriedade nome que vem no query
    if(nome && nome.length > 2){ // Caso o nome exista no corpo da request e tenha mais de 2 caracteres nós atribuimos o valor a propriedade nome do usuário
      usuario.nome = nome;
    };

    const {file} = req;  // Usando um destructor cria uma constante file com a propriedade file que vem no request
    if(file && file.originalname){ // Verifica se há algum file e se há um originalname no file
      const image = await uploadImagemCosmic(req); // Utiliza o upload do cosmic para colocar a imagem no bucket
      if(image && image.media && image.media.url){  // Caso alguma imagem seja carregada e exista a propriedade media e a propriedade url dentro de media iremos atribuir a url ao avatar do usuário
        usuario.avatar = image.media.url;
      }
      
    }

    await UsuarioModel.findByIdAndUpdate({_id : usuario._id}, usuario); // Atualizaremos o usuário no DB com o que foi passado para a mudança

    return res.status(200).json({msg: 'Usuário alterado com sucesso'});

  } catch (e) {
    console.log(e);
    return res.status(400).json({erro: 'Não foi possível atualizar o usuário' + e});
  }
  
}).get( // Utiliza o método GET do NC para obter dados do usuário
     async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const {userID} = req?.query;  // Usando um destructor cria uma constante userID com a propriedade userID que vem no query da request se a request existe
      const usuario = await UsuarioModel.findById(userID);  // Busca no Banco de Dados o usuário pelo id

      usuario.senha = null; // Definimos usuario.senha como null para a senha do usuário não ficar trafegando, pois quando fazemos a pesquisa pelo ID do usuário a DB retorna todos os dados existentes na coleção referente aquele usuário
      return res.status(200).json(usuario); // Retorna com sucesso o usuário

    } catch (e) {
      console.log(e);
      return res.status(400).json({erro: 'Não foi possível obter dados do usuário'})
    }});

export const config = { // Passa uma configuração para o NEXT não transformar a resposta em JSON e enviar a request como FormData devido a estarmos passando um arquivo
  api: {
    bodyParser: false
  }
}


export default politicaCORS(validarTokenJWT(conectarMongoDB(handler)));  // Exporta o manipulador criado passando por todos os middlewares necessários
