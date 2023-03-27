import multer from "multer"; // Importa o multer para fazer o upload da imagem
import cosmicjs from "cosmicjs"; // Importa o Cosmic para guardar as imagens nos buckets

const {
  CHAVE_GRAVACAO_AVATARES,
  CHAVE_GRAVACAO_PUBLICACOES,
  BUCKET_AVATARES,
  BUCKET_PUBLICACOES
} = process.env; // Busca as chaves dos buckets nas variáveis de ambiente do sistema

const Cosmic = cosmicjs(); // Cria a instância do cosmic
const bucketAvatares = Cosmic.bucket({ // Define o objeto com a identificação do bucket de avatares contendo o slug e a chave de escrita
  slug: BUCKET_AVATARES,
  write_key: CHAVE_GRAVACAO_AVATARES
});

const bucketPublicacoes = Cosmic.bucket({ // Define o objeto com a identificação do bucket de publicações contendo o slug e a chave de escrita
  slug: BUCKET_PUBLICACOES,
  write_key: CHAVE_GRAVACAO_PUBLICACOES
});

const storage = multer.memoryStorage(); // Armazena o arquivo na memória como um objeto buffer
const upload = multer({ storage: storage }); // Define no Multer onde fará o salvamento do arquivo

const uploadImagemCosmic = async (req: any) => { // Criação da função que enviará para o Cosmic a imagem guardada pelo multer
  if (req?.file?.originalname) { // Verifica se existe request e se dentro da request existe um file e se o file possui uma propriedade originalname
    if(!req.file.originalname.includes('.png') && !req.file.originalname.includes('.jpg') && !req.file.originalname.includes('.jpeg')){
      throw new Error('Extensão da imagem inválida'); // Verifica se o arquivo carrega tem a extensão válida
    }
    const media_object = { // Cria um objeto para guardar a midia contendo o originalname e o buffer
      originalname: req.file.originalname,
      buffer: req.file.buffer
    }

    if (req.url && req.url.includes('publicacao')) { // Verifica se na url do request possui a palavra publicação, caso exista irá adicionar a imagem ao bucket de publicação
      return await bucketPublicacoes.addMedia({ media: media_object });
    } else { // Caso não tenha publicacao na url significa que é um avatar então irá adicionar a imagem do avatar no bucket de avatar
      return await bucketAvatares.addMedia({ media: media_object });
    }
  }
}

export { upload, uploadImagemCosmic }; //Exporta as duas funções criadas
