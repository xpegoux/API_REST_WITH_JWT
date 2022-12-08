# API REST Authentication with JWT + MYSQL

## Introdução

Esta é uma simples aplicação de autenticação utilizando o **JSON WEB TOKEN (JWT)** fazendo o uso de boas práticas de segurança com os dados de autenticação criptografados na WEB e no Banco de Dados.

O *database* **MYSQL** possui tabelas simples e dados não oficiais (por isso estão expostos nos *prints* a seguir), com armazenamento de *passwords* criptografados.

## Explicando arquivo jwt.js

Dentro do arquivo **/server/jwt.js** possui a importação da ***lib* jsonwebtoken** as constantes contidas para a implementação e configuração servem para:

+ **secret** => Algoritmo para criptografar o *payload*. A secret é responsável por criptografar e decodificar o **token**, então é muito importante deixá-lo bem guardado para evitar furos na integridade dos dados trafegados.
E também, toda a aplicação deve utilizar apenas uma *secret* como um todo para não bagunçar o programa com diversos *secrets*.
+ **sign** => O parâmetro (*payload*) são dados trafegados criptografados com o token (*secret*), e, o objeto *expiresIn: 86400* é o tempo de expiração do mesmo.
+ **verify** => Função para decodificar o token, que é utilizada no *middleware* (**authMiddleware**) para o uso da rota (**/me**) que dispõe da consulta de um token específico se ainda está ativo e retorna o usuário logado em tal token.

## INDEX.JS

### Rota post(/cadastro)

A rota **/cadastro** como o nome diz, é para o cadastro do usuário no *database*, e por tal motivo a mesma e todas as outras são assíncronas. Para utilizar esta rota basta passar no **INSOMNIA** via **JSON** os dados de cadastro. O código inicia-se com um tratamento simples para erros, caso dando algum erro retornando apenas um *status code* 401.
```
const { nameBody, passBody, emailBody } = req.body;
const user = await UserModel.novoUsuario(nameBody, passBody, emailBody); 
```
O trecho de código acima recupera do *body* as variáveis para o (nome, senha e email) do usuário respectivos para o banco.
```
const token = jwt.sign({ user: emailBody });
```
Em seguida, é chamada a função **sign** do pacote **jwt** que foi configurado, e é usada como *payload* o email do usuário para obter um *token* de autenticação. Retornando assim o *status code* 201 de criação realizada com sucesso, observa-se na imagem abaixo, referente a esta rota de cadastro que ele retorna com sucesso o *token* criado.

![poc token cad com sucesso](cadastro)

Observa-se também, que, no *database* todas as senhas estão **codificadas**.

### Rota get(/login)
```
const [, hash] = req.headers.authorization.split(' ');
const [emailBody, passBody] = Buffer.from(hash, 'base64').toString().split(':');
```
Basicamente o trecho acima é um tratamento de segurança, utilizando a consulta **Basic** no **INSOMNIA** para retornar um **base64**, e depois fazer um *decode* no lado do servidor para realizar a consulta com o *database*. A primeira linha contém o *hash* recebido do **headers.authorization**.
Esse *hash* é feito um **split** para retirar um "texto lixo" e ter uma saída limpa do *hash Basic*, e, depois é passado para **emailBody** e **passBody** a decodificação para *string* do *hash* e ambas variáveis são passadas como parâmetro para a consulta no *database* do trecho abaixo:
```
const credenciais = await UserModel.findOne(emailBody, passBody);
```
Que é uma *query* lá do *database*, depois vem os tratamentos de verificação com o *database* e é retornado as credenciais com o *token*. O legal é que tudo isso fica criptografado no *header* da requisição, como segue na imagem abaixo exibindo o *Basic*:

![poc basic cripto on header](login_token_body)

E caso as credenciais estejam inválidas será retornado um *status code* 401 com acesso não autorizado:

![poc token invalido](login_token_pass_errada)

E por fim no ainda na mesma autenticação, caso retorne todas credenciais correamente, pode-se verificar o *token* desta sessão.

![poc token validado](login_token_pass_correta)

### Rota get(/users)

A rota **/users** está atrelada ao **authMiddleware**, onde primeiro, será executado todo o processo no *middleware* para depois a rota **/users** ser chamada retornado todos os usuários do banco ao confirmar o *token* de acesso correto.
No **authMiddleware** é feito primeiro a captura da requisição Bearer onde será passado o *token* e depois a decodificação deste *token* utilizando o **jwt.verify()** e aí é chamada a *query* do *database* passando o *payload* do *token* decodificado que contém a credencial do email como um id de busca.
Após confirmar, se a busca no banco retornar algum erro o nada, é retornado um *status code* 401, geralmente, vai retornar este erro se o *token* estiver incorreto, como no exemplo da imagem abaixo onde deletei alguns caracteres do *token* do usuário '**Jaco**'.

![poc token auth incorreta](token_auth_errada)

Se der tudo certo, é passado para **req.auth** os dados do usuário autenticado pelo *token* que é utilizado na rota **/me**, e dar um **next()** para por fim, chamar a rota **/users**.

![poc token auth correta](token_auth_correta)

### Rota get(/me)

Como foi dito no parágrafo anterior, o **authMiddleware** faz uma atribuição do *token* para informar à quem ele pertence, e esta rota é justamente para isso, mostrar o usuário em si, autenticado pelo *token* passando na autenticação. Abaixo na imagem podemos verificar apenas os dados do **Jaco** onde foi realizado a autenticação com o seu *token*.

![poc token auth apenas um](token_auth_only_user)
