# Prompt utilizado para gerar o frontend

## Como o prompt foi usado

O frontend foi construído em conversa com a IA Claude, por refinamentos sucessivos. O prompt detalhado abaixo reúne, em um único texto, os requisitos que resultaram da conversa. Os pedidos feitos em sequência estão no final deste documento.

## Prompt detalhado

Você é um desenvolvedor frontend sênior. Gere o frontend de uma aplicação web chamada **Cadastro de Filmes**, integrada a um backend Java já pronto e testado no Postman.

### Contexto da aplicação

O backend usa Spring Boot, Spring Data JPA e PostgreSQL. Ele serve arquivos estáticos a partir de `src/main/resources/static`, então frontend e backend ficam na mesma origem (`http://localhost:8080`). Use URLs relativas e não adicione configuração de CORS.

Use apenas HTML, CSS e JavaScript puros, com módulos ES. Não use frameworks, bibliotecas JavaScript nem etapa de build.

### Contrato da API

| Verbo | Rota | Corpo enviado | Resposta de sucesso |
|---|---|---|---|
| GET | `/filmes` | nenhum | 200 e array de filmes |
| GET | `/filmes/{id}` | nenhum | 200 e o filme |
| POST | `/filmes` | JSON do filme, sem `id` | 201 e o filme criado |
| PUT | `/filmes/{id}` | JSON do filme, sem `id` | 200 e o filme atualizado |
| DELETE | `/filmes/{id}` | nenhum | 204 sem corpo |
| GET | `/filmes/pesquisa?termo={texto}` | nenhum | 200 e array de `{ tmdbId, titulo, anoLancamento, capaUrl }` |
| GET | `/filmes/pesquisa/{tmdbId}` | nenhum | 200 e os dados do filme, sem `id` |

Formato do filme:

```json
{
  "id": 1,
  "titulo": "Duna",
  "diretor": "Denis Villeneuve",
  "genero": "Ficção científica",
  "anoLancamento": 2021,
  "capaUrl": "https://image.tmdb.org/t/p/w500/exemplo.jpg",
  "sinopse": "Texto da sinopse."
}
```

Um `id` inexistente retorna 404 em JSON, com o texto do erro na propriedade `message`. No PUT, um campo enviado como `null` mantém o valor já gravado. A pesquisa retorna 503 sem token configurado e 502 se o TMDB falhar; o token fica somente no backend.

### Funcionalidades

1. Ao abrir a página, chamar `GET /filmes` e exibir todos os filmes.
2. Botão "Novo filme" que abre um formulário e, ao confirmar, chama `POST /filmes`.
3. Ao clicar em um filme, chamar `GET /filmes/{id}` e abrir a capa com as informações da resposta.
4. Na capa, o botão "Editar filme" abre o formulário preenchido. Salvar a edição com `PUT /filmes/{id}`.
5. Excluir com `DELETE /filmes/{id}`, exigindo confirmação em dois cliques no mesmo botão.
6. Depois de cada alteração, recarregar a lista com `GET /filmes`.
7. Busca instantânea no navegador, sem acento e sem diferenciar maiúsculas, por título, diretor ou gênero. ID e ano devem corresponder ao número exato.
8. Ao digitar pelo menos 2 letras no título, aguardar 350 ms e chamar `GET /filmes/pesquisa`, ignorando respostas antigas. Ao escolher uma sugestão, chamar `GET /filmes/pesquisa/{tmdbId}` e preencher todos os campos. Se a pesquisa falhar, informar o motivo e manter o preenchimento manual.

### Componentes da interface

- **Barra superior fixa:** nome da aplicação, total de filmes, campo de busca e botão "Novo filme".
- **Destaque:** filme mais recente com capa, com a própria capa desfocada ao fundo, título grande, sinopse e botão "Abrir capa". Fica oculto durante a busca.
- **Prateleiras:** uma fileira horizontal por gênero, com a maior primeiro. Cada card mostra capa 2:3, título, ano e ID. Durante a busca, exibir uma grade única de resultados.
- **Capa gerada:** sem imagem ou se ela falhar, gerar cor e figura geométrica a partir do título, de forma que o mesmo título sempre produza o mesmo cartaz. Use 7 paletas e 3 figuras: círculo, diagonal e faixas.
- **Capa aberta:** `<dialog>` que simula um estojo. A capa começa fechada sobre as informações e gira na lombada para a esquerda, revelando título, ano, gênero, ID, direção, sinopse e o botão "Editar filme". Em telas estreitas, a capa fica acima das informações, sem giro.
- **Painel lateral:** elemento `<dialog>` nativo, à direita, com os campos Título, Diretor, Gênero e Ano de lançamento, obrigatórios, e Endereço da capa e Sinopse, opcionais. Todos com `<label>` visível. Ano entre 1888 e 2100. Sugestões do TMDB logo abaixo do título, com o aviso de atribuição exigido pelo TMDB.
- **Monitor de requisições:** barra fixa no rodapé mostrando a última requisição. Ao expandir, lista as últimas 30, cada uma com verbo em cor própria, URL, status e tempo. Ao expandir um item, mostra o JSON enviado e o JSON recebido.
- **Mensagens:** confirmação temporária ao salvar ou excluir, sem usar `alert`. Tratar acervo vazio, busca sem resultado e servidor indisponível, sempre com uma ação para o usuário continuar.

### Organização do código

Separe as responsabilidades nestes arquivos:

- `index.html`: estrutura da página.
- `style.css`: visual, com as cores em variáveis CSS.
- `api.js`: único arquivo que usa `fetch`. Exporta `filmesApi` com `listar`, `buscar`, `salvar`, `excluir`, `pesquisar` e `detalharPesquisa`, e transforma falhas em `Error` com mensagem em português.
- `monitor.js`: exibe as requisições informadas por `api.js`.
- `catalogo.js`: funções puras de busca, prateleiras, destaque e escolha do cartaz, testáveis sem navegador.
- `dom.js`: função de criação de elementos com `textContent`.
- `script.js`: estado da tela, eventos e desenho do acervo.

### Identidade visual

Use sites de streaming como referência de organização, mas de forma original. O site deve parecer um produto profissional e moderno, não um slide nem uma coleção de formulários empilhados.

- Noite `#06222b` no fundo da página.
- Petróleo `#0b3c49` em superfícies.
- Mostarda `#f5b83d` nas ações principais.
- Coral `#d03e27` e `#ff8a75` em erros e ações destrutivas.
- Verde `#0f6b5c` em confirmações.
- Verbos do monitor: GET `#5fd3b3`, POST `#f5b83d`, PUT `#8ab4ff`, DELETE `#ff8a75`.
- Fontes: Big Shoulders Display nos títulos dos cartazes e Instrument Sans na interface.

### Requisitos de qualidade

- Layout responsivo a partir de 375 px, sem rolagem horizontal.
- Foco visível no teclado, contraste de texto de pelo menos 4,5:1 e respeito a `prefers-reduced-motion`.
- Nunca inserir dados do backend com `innerHTML`.
- Todo texto da interface em português do Brasil.

### Critérios de aceite

- Cadastrar, abrir, editar e excluir funcionam contra o backend real e persistem no PostgreSQL.
- Os verbos GET, POST, PUT e DELETE aparecem no monitor com o status correto.
- Abrir um filme que já foi excluído mostra a mensagem do backend e atualiza o acervo.
- Com o servidor desligado, a página informa o problema e oferece "Tentar novamente".
- Escolher uma sugestão preenche título, diretor, gênero, ano, capa e sinopse.
- O token do TMDB nunca aparece no navegador nem no repositório.

## Pedidos feitos em sequência

1. Backend: integração com PostgreSQL com base nas instruções da disciplina e no vídeo indicado, tendo filmes como assunto.
2. "faça um css bonito para esse site agora por gentileza utilize suas skills boas ai, nao faça nada generico, mas precisa ter a ver com o tema"
3. "nao gostei o design por que esta parecendo um slide, faça parecer mais profissional e moderno"
4. "consegue adicionar algumas cores no site, crie uma paleta legal e mais alguma coisa", junto com o enunciado desta avaliação.
5. "utilize como base para fazer o css sites de streaming, mas de uma forma original, se possivel na hora que clicar no card do filme abrir a capa com as informações, seria legal se tivesse ligada uma api que busca os filmes e já completa automatico para vc, tem como fazer isso?"
