# Devagram Node NectJs

Projeto desenvolvido em Typescript para estudo do Next na formação da Devaria 2023.

## Implementação na Vercel

[Devagram](https://devagram-node-nextjs-wheat.vercel.app/)

### Tecnologias Utilizadas

- Nextjs 13.2.4
- Node 18.15.0
- CosmicJS/sdk 1.0.9
- JsonWebToken 9.0.0
- Multer 1.4.5

### Configuração do ambiente de desenvolvimento

1. Clonar o repositório `git clone <url_git>`
1. Fazer uma cópia do arquivo .env.example e renomear o novo arquivo para `.env.local`
1. Configuraar as variáveis de ambiente no arquivo `.env.local`
1. Instalar as dependencias do projeto `npm i`
1. Executar o comando `npm run dev` no terminal para subir a aplicação 


### Implementações desenvolvidas por mim

1. Sistema de notificações;
1. Sistema de stories.

#### Notificações

Criação de um endpoint que gera notificações para os usuários

- Ao curtir uma publicação, comentar uma publicação ou seguir um usuário é gerada uma notificação seguindo o seguinte modelo:

```javascript 
{
  usuarioAcao: String, // Usuário logado que executou a ação
  usuarioNotificado: String, // usuário a ser notificado
  publicacao: String, // ID da publicaçao, caso necessário
  tipo: String, // Tipo da notificação, pode ser "seguir", "curtir" ou "comentário"
  dataNotificacao: Date, // Data da geração da notificação
  visualizada: Boolean // Informa se o usuário já visualizou a notificação
}
 ```

- O endpoint notificacoes possui as seguintes rotas:

  1. GET 
      - Realiza uma busca no banco de dados das notificações que correspondem ao usuário;
      - Retorna as notificações do seguinte modo:
        ```javascript
        {
        novas:[
          usuarioAcao: String,
          usuarioNotificado: String,
          publicacao: String,
          tipo: String,
          dataNotificacao: Date,
          visualizada: Boolean
          ],
        ultimosSeteDias:[
          usuarioAcao: String,
          usuarioNotificado: String,
          publicacao: String,
          tipo: String,
          dataNotificacao: Date, 
          visualizada: Boolean
          ],
        ultimosTrintaDias:[
          usuarioAcao: String,
          usuarioNotificado: String,
          publicacao: String,
          tipo: String,
          dataNotificacao: Date,
          visualizada: Boolean 
          ],      
        };
        ```
      - Deleta as notificações com mais de 30 dias.

  1. PUT
      - Busca as notificações do usuário logado e muda a propriedade visualizada de false para true em todas notificações não visualizadas.

#### Stories

Criação de um endpoint onde o usuário posta uma foto que poderá ser visualizada por 24h, após esse tempo o stories é apagado.

- O storie é criado seguindo o seguinte modelo:
```javascript
  {
    idUsuario: String, // Id do usuário que postou o storie
    foto: String, // URL da foto hospedada no cosmicjs
    data: Date // Data da publicação do storie
  }
```

- O endpoint tem as seguinte rotas:
  1. POST
      - Recebe uma foto e cria o storie no banco de dados.
  1. GET
      - Caso seja passado o id de um usuário como query da requisição é retornado apenas os stories das últimas 24h daquele usuário específico. Do seguinte modo:
        ```javascript
          {
            idUsuario: String,
            foto: String,
            data: Date
          }
        ```
      - Caso não seja passado nada como query é retornado o stories de todos os usários que o usuário logado segue, além de seus próprios stories, respeitando o período de 24h. Do seguinte modo:
        ```javascript
          {
            idUsuario: String,
            foto: String,
            data: Date,
            usuario: {
              nome: String,
              avatar: String
            }
          }
        ```
      Stories com mais de 24h são apagados do banco de dados
