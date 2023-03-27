import type { NextApiRequest, NextApiResponse  } from "next"; // Request, Response e Handler padrão do Next
import { politicaCORS } from "@/middlewares/politicaCORS"; // Importando o middleware de CORS que criamos
import { validarTokenJWT } from "@/middlewares/validarTokenJWT"; // Importando o middleware de validação do token JWT criado
import { conectarMongoDB } from "@/middlewares/conectarMongoDB"; // Importando o middleware de conexão com DB que foi criado
import type { RespostaPadraoMsg } from "@/types/RespostaPadraoMsg"; // Importando o tipo de resposta padrão que criamos
import { UsuarioModel } from "@/models/UsuarioModel"; // Importando o model do Usuário


const pesquisaEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {
    try {
        if(req.method === "GET"){ // Verificando o método HTTP do request caso seja algo diferente de GET retornará que o método não é válido
            if(req?.query?.id){ // Verifica se há um request e se esse request possui uma propriedade id. Esse caso é para uma pesquisa por ID
                const usuariosEncontrado = await UsuarioModel.findById(req?.query?.id); // Busca na DB o usuário usando o id
                usuariosEncontrado.senha = null; // Define a senha do usuário como Null pra não ficar trafegando a senha do usuário
                if(!usuariosEncontrado){ // Caso não retorne um usuário retorna um erro de usuário não encontrado
                    return res.status(400).json({erro: 'Usuário não encontrado'})
                }
                return res.status(200).json(usuariosEncontrado); // Retorna o usuário encontrado pelo id
            }else{ // Caso não seja passado nenhum id pelo query faremos a busca pelo filtro
                const {filtro} = req.query; // Usando um destructor pegamos a propriedade filtro da query da request

                if(!filtro || filtro.length < 2){ // Caso não haja filtro ou o filtro tenha menos de 2 caracteres retorna um erro pedindo pra informar pelo menos 2 caracteres
                    return res.status(400).json({erro: 'Favor informar pelo menos 2 caracteres para a busca'})
                }

                const usuariosEncontrados = await UsuarioModel.find({ // Busca na DB conforme o filtro
                    $or: [ // Passando mais de um parametro para a busca
                        {nome : {$regex : filtro, $options: 'i'}}, // Pesquisa pelo nome usando o options i para ignorar o case sensitive
                        {email : {$regex : filtro, $options: 'i'}} // Pesquisa pelo email usando o options i para ignorar o case sensitive
                    ]
                    
                });

                return res.status(200).json(usuariosEncontrados) ; // Retorna os usuário encontrados pelo DB
            }


            

        }
        
    } catch (e) { // Caso encontre algum erro imprime o erro no console
        console.log(e);
        return res.status(500).json({erro: 'Não foi possível buscar usuários: ' + e})
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint))); // Exporta o endpoint de pesquisa passando pelos middlewares necessários