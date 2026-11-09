# Guia da apresentação individual

Use o monitor "Requisições HTTP", no rodapé do site, para mostrar cada requisição enquanto explica.

## Visão geral

```text
Navegador                         Spring Boot                       PostgreSQL
script.js -> api.js  --HTTP-->  FilmeController -> FilmeService -> FilmeRepository -> tabela filmes
script.js <- api.js  <--JSON--  FilmeController <- FilmeService <- FilmeRepository <- tabela filmes

Busca automática:
script.js -> api.js  --HTTP-->  FilmeController -> PesquisaFilmeService --HTTP--> TMDB
```

O Spring Boot serve os arquivos de `src/main/resources/static` e também responde a API. Por isso, frontend e backend têm a mesma origem, e o JavaScript usa URLs relativas como `/filmes`.

## 1. Como o frontend faz uma requisição HTTP

Todas as chamadas estão em `api.js`, na função `requisitar`, que usa `fetch(url, opcoes)`. O `fetch` é assíncrono: o `await` espera a resposta sem travar a página.

`script.js` não conhece URLs. Ele apenas chama `filmesApi.listar()`, `buscar(id)`, `salvar(filme, id)`, `excluir(id)`, `pesquisar(termo)` ou `detalharPesquisa(tmdbId)`.

## 2. Como os verbos HTTP são usados

| Ação na tela | Verbo e rota | Método do controller | Sucesso |
|---|---|---|---|
| Abrir a página ou atualizar a grade | `GET /filmes` | `listarFilmes` | 200 |
| Clicar em um card | `GET /filmes/{id}` | `buscarFilme` | 200 |
| Digitar o título no cadastro | `GET /filmes/pesquisa?termo=` | `pesquisarFilmes` | 200 |
| Escolher uma sugestão | `GET /filmes/pesquisa/{tmdbId}` | `detalharPesquisa` | 200 |
| Cadastrar filme | `POST /filmes` | `cadastrarFilme` | 201 |
| Salvar alterações | `PUT /filmes/{id}` | `atualizarFilme` | 200 |
| Excluir filme | `DELETE /filmes/{id}` | `deletarFilme` | 204 |

`filmesApi.salvar` escolhe o verbo: com `id` usa PUT, sem `id` usa POST.

## 3. Como os dados vão do frontend para o backend

1. `lerFormulario`, em `script.js`, lê os campos e monta um objeto JavaScript.
2. `filmesApi.salvar` converte o objeto em texto com `JSON.stringify` e o coloca no corpo (`body`).
3. O cabeçalho `Content-Type: application/json` informa ao backend o formato.
4. O `id` vai na URL, como em `/filmes/4`.

## 4. Como o backend processa e responde

Exemplo: `PUT /filmes/4`.

1. O `@RestController` com `@RequestMapping("/filmes")` e o `@PutMapping("/{id}")` direcionam a requisição para `atualizarFilme`.
2. `@PathVariable` pega o `4` da URL. `@RequestBody` faz o Jackson converter o JSON em um objeto `Filme`.
3. `FilmeService.atualizarFilme` busca o registro. Se não existir, lança `ResponseStatusException` com 404.
4. O service monta o filme atualizado. Campo `null` mantém o valor antigo.
5. `saveAndFlush`, do `FilmeRepository`, usa JPA e Hibernate para executar o SQL no PostgreSQL. Com `show-sql=true`, o comando aparece no console.
6. `ResponseEntity.ok(...)` devolve status 200, e o Jackson converte o `Filme` em JSON.

## 5. Como o frontend recebe e apresenta os dados

1. `requisitar` lê a resposta e converte o JSON em objeto.
2. Ela informa o resultado ao monitor e verifica `resposta.ok`. Em erro, lança `Error` com a mensagem do backend.
3. `carregarAcervo`, em `script.js`, guarda a lista e chama `desenharAcervo`.
4. `criarCard` cria os elementos da tela com `textContent`, o que impede que um dado salvo vire código HTML.
5. Erros são capturados com `try/catch` e aparecem como mensagem para o usuário.

## Busca automática de filmes

1. `agendarPesquisa`, em `script.js`, espera 350 ms depois da última tecla para não chamar a API a cada letra.
2. O backend recebe `GET /filmes/pesquisa?termo=duna`, e o `PesquisaFilmeService` consulta o TMDB com `RestClient`.
3. O TMDB devolve JSON, que o Jackson converte nos `record` da classe. O service transforma esses dados em `SugestaoFilme`.
4. Ao escolher um filme, `GET /filmes/pesquisa/{tmdbId}` busca diretor, gênero, capa e sinopse, e `preencherFormulario` completa os campos.
5. Nada é salvo nessa etapa. O filme só vai para o PostgreSQL quando o usuário clica em "Cadastrar filme", com o POST normal.

## 6. Como o prompt orientou a IA

Mostre no [prompt](PROMPT.md):

- O **contrato da API** definiu rotas, verbos, JSON e status, que a IA seguiu em `api.js`.
- As **funcionalidades** ligaram cada ação da tela a um endpoint.
- A **organização do código** concentrou o `fetch` em um único arquivo.
- Os **critérios de aceite** definiram como conferir o funcionamento.

Explique também que o resultado veio de refinamentos: a primeira versão foi rejeitada por parecer um slide, e o pedido seguinte levou ao formato de aplicativo.

## Roteiro de demonstração

1. Abra o monitor no rodapé e recarregue a página: aparece `GET /filmes` com 200.
2. Em "Novo filme", digite um título e escolha uma sugestão: aparecem as duas chamadas de `/filmes/pesquisa`. Cadastre o filme: aparece `POST /filmes` com 201 e, depois, `GET /filmes`.
3. Expanda o POST e mostre o JSON enviado e o recebido.
4. Clique no card: aparece `GET /filmes/{id}` com 200, e a capa abre com as informações.
5. Clique em "Editar filme", altere o gênero e salve: aparece `PUT /filmes/{id}` com 200.
6. Rode `select * from filmes;` no pgAdmin para provar que salvou.
7. No painel de edição, exclua o filme: aparece `DELETE /filmes/{id}` com 204.

## Perguntas prováveis

**Por que 204 no DELETE?** A operação deu certo e não há conteúdo para devolver.

**Por que 201 no POST?** Indica que um novo recurso foi criado.

**Diferença entre PUT e POST?** POST cria um recurso em `/filmes`. PUT atualiza o recurso identificado em `/filmes/{id}`.

**O que é JSON?** Texto estruturado que frontend e backend usam para trocar dados.

**Quem cria a tabela?** O Hibernate, por causa de `spring.jpa.hibernate.ddl-auto=update`.

**Por que não há erro de CORS?** A página e a API estão na mesma origem.

**O que acontece em um ID inexistente?** O service lança 404, o Spring responde em JSON e o frontend exibe "Filme não encontrado".

**Por que a busca do TMDB passa pelo backend?** Para o token ficar no servidor. Se o navegador chamasse o TMDB, qualquer pessoa veria o token.

**Onde fica o token?** No arquivo `tmdb.properties`, importado pelo `application.properties` e listado no `.gitignore`.

**E se o TMDB estiver fora do ar?** O backend responde 502, o site informa o problema e o cadastro manual continua funcionando.
