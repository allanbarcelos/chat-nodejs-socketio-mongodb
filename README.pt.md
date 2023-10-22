# Simple NODEJs Chat

## Introdução
Esta aplicação é um simples chat em tempo real que utiliza Node.js, Socket.io e MongoDB. Ela permite que os usuários se conectem e conversem em salas de chat criadas dinamicamente. Esta documentação irá guiá-lo através dos passos para configurar e usar a aplicação.

## Pré-requisitos
Antes de iniciar, certifique-se de que você possui o seguinte instalado em seu sistema:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

## Instalação
Siga os passos abaixo para instalar a aplicação:

1. Clone o repositório para o seu sistema local:
   ```bash
   git clone https://github.com/allanbarcelos/simple-nodejs-socketio-mongodb-chat.git
   ```

2. Acesse o diretório do projeto:
   ```bash
   cd simple-nodejs-socketio-mongodb-chat
   ```

3. Instale as dependências usando npm ou yarn:
   ```bash
   npm install
   ```

## Configuração
Antes de iniciar a aplicação, você precisa configurar o banco de dados MongoDB e outros parâmetros. Você pode fazer isso editando o arquivo `config.js` no diretório raiz do projeto. Aqui estão algumas configurações importantes:

- `dbURL`: A URL de conexão com o banco de dados MongoDB.
- `sessionSecret`: A chave secreta para a sessão da aplicação.

Certifique-se de que o MongoDB está em execução antes de iniciar a aplicação.

## Executando a Aplicação
Para iniciar a aplicação, execute o seguinte comando no diretório do projeto:

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000` por padrão.

## Uso
A aplicação fornece as seguintes funcionalidades:

- **Registro de Usuário**: Os usuários podem se registrar fornecendo um nome de usuário e senha.
- **Login de Usuário**: Os usuários registrados podem fazer login com suas credenciais.
- **Chat em Tempo Real**: Os usuários conectados podem ingressar em salas de chat e enviar mensagens em tempo real para outros participantes da sala.
- **Criar/Entrar em Salas de Chat**: Os usuários podem criar novas salas de chat ou entrar em salas existentes.
- **Logout**: Os usuários podem fazer logout de suas contas.

## Contribuindo
Se desejar contribuir para o projeto, sinta-se à vontade para criar pull requests ou relatar problemas no repositório GitHub.

## Licença
Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](https://github.com/allanbarcelos/simple-nodejs-socketio-mongodb-chat/blob/master/LICENSE) para obter mais detalhes.

## Autor
Este projeto foi criado por [Allan Barcelos](https://github.com/allanbarcelos).

## Contato
Para qualquer dúvida ou suporte, você pode entrar em contato com o autor ou abrir uma "issue" no repositório GitHub.