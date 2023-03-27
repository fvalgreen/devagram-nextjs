import type { NextApiResponse } from "next"; // Request, Response e Handler padrão do Next
import { validarTokenJWT } from "@/middlewares/validarTokenJWT"; // Importando o middleware de validação do token JWT criado
import { conectarMongoDB } from "@/middlewares/conectarMongoDB"; // Importando o middleware de conexão com DB que foi criado
import { politicaCORS } from "@/middlewares/politicaCORS"; // Importando o middleware de CORS que criamos
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import nc from "next-connect"; // Importando o Next Connect para facilitar a conexão HTTP
import { PublicacaoModel } from "@/models/PublicacaoModel"; // Importando o model da Publicação
import { UsuarioModel } from "@/models/UsuarioModel"; // Importando o model do Usuário
import { upload, uploadImagemCosmic } from "@/services/uploadImagemCosmic"; // Importando as funções que criamos para utilização do Cosmic e Mutler

const handler = 
    nc() // Utilizando o nc do Next Connect que serve para "gerenciar" as requisições e resposta HTTP
    .use(upload.single("file")) // utiliza o Multer para fazer upload de um único arquivo
    .post(async (req : any, res: NextApiResponse<RespostaPadraoMsg>) => {// Utiliza o método POST do NC

        try { // Trativa de erro, caso dê algum erro na tentativa o catch pegará esse erro e será possível tratar ele
            
            const {userID} = req.query; // Usando um destructor cria uma constante userID com a propriedade userID que vem no query da request se a request existe
            
            const usuario = await UsuarioModel.findById(userID); // Busca no Banco de Dados o usuário pelo id
            
            if(!usuario){ // Caso a DB não retorne um objeto retorna um erro de usuário não encontrado
                return res.status(400).json({erro: 'Usuário não encontrado'})
            }

            if(!req || !req.body){ // Caso não exista um request ou o request não tenha corpo
                return res.status(400).json({erro: 'Parametros de entrada inválidos'})
            }
            const {descricao} = req?.body; // Usando um destructor caso exista uma request pega no corpo da request a propriedade de descricao

            if(!descricao || descricao.length < 2){ // Caso não haja a descrição ou ela tenha o comprimento menor que 2 retorna um erro de descrição inválida
                return res.status(400).json({erro: 'Descrição inválida'})
            }
            if(!req.file || !req.file.originalname){ // Caso não tenha um arquivo na request ou ele não possua a propriedade originalname retorna um erro de imagem obrigatória
                return res.status(400).json({erro: 'Imagem é obrigatória'});
            }

            const image = await uploadImagemCosmic(req); // Utiliza o upload do cosmic para colocar a imagem no bucket
            const publicacao = { // Constrói a estrutura de como será a publicação conforme o PublicacaoModel
                idUsuario : usuario._id, // Pega o id do usuário 
                descricao, // Pega a descrição 
                foto : image.media.url, // Pega a url da imagem que fica na propriedade media
                data : new Date() // Pega a data da hora da publicação
            }
            usuario.publicacoes++; // Adiciona 1 no valor de publicações do usuário
            await UsuarioModel.findByIdAndUpdate({_id: usuario._id}, usuario); // Atualiza o usuário pra passar o novo número de publicações
            
            await PublicacaoModel.create(publicacao); // Cria a publicação na collection e retorna uma mensagem de sucesso

            return res.status(200).json({msg: 'Postagem criada com sucesso'});
        } catch (e) {
            console.log(e);
            return res.status(400).json({erro: 'Erro ao cadastrar publicação'});
        }        
});

export const config = {  // Passa uma configuração para o NEXT não transformar a resposta em JSON e enviar a request como FormData devido a estarmos passando um arquivo
    api : {
        bodyParser : false
    }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(handler))); // Exporta o manipulador criado passando por todos os middlewares necessários