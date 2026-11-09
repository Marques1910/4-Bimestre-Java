# Cadastro de Filmes

Aplicação web para cadastrar, consultar, editar e excluir filmes. O backend é uma API REST em Java com Spring Boot e PostgreSQL. O frontend, gerado com auxílio de Inteligência Artificial, é servido pelo próprio Spring Boot.

## Como executar

Requisitos: JDK 25 e PostgreSQL rodando em `localhost:5432`, com usuário e senha `postgres`.

1. Crie o banco `cadastro_filmes`. A tabela é criada automaticamente pelo JPA.
2. Execute `CadastroFilmesApplication` no IntelliJ, ou rode `./mvnw spring-boot:run`.
3. Abra http://localhost:8080.

## Endpoints

| Verbo | Rota | Corpo enviado | Resposta de sucesso | Uso na interface |
|---|---|---|---|---|
| GET | `/filmes` | nenhum | 200 e lista de filmes | Carregar o acervo |
| GET | `/filmes/{id}` | nenhum | 200 e o filme | Abrir um cartaz para edição |
| POST | `/filmes` | JSON do filme | 201 e o filme criado | Cadastrar filme |
| PUT | `/filmes/{id}` | JSON do filme | 200 e o filme atualizado | Salvar alterações |
| DELETE | `/filmes/{id}` | nenhum | 204 sem conteúdo | Excluir filme |

Formato do JSON:

```json
{
  "titulo": "Duna",
  "diretor": "Denis Villeneuve",
  "genero": "Ficção científica",
  "anoLancamento": 2021
}
```

Um `id` inexistente retorna 404 com a mensagem `Filme não encontrado`.

## Estrutura

```text
src/main/java/com/filmes/cadastro_filmes
├── controller       Recebe as requisições HTTP
├── business         Regras de negócio
└── infrastructure
    ├── entitys      Entidade Filme, mapeada para a tabela filmes
    └── repository   Acesso ao banco com Spring Data JPA

src/main/resources/static
├── index.html       Estrutura da página
├── style.css        Visual
├── script.js        Eventos e atualização da tela
├── api.js           Todas as chamadas HTTP ao backend
├── monitor.js       Painel que mostra as requisições feitas
├── catalogo.js      Regras de busca e geração dos cartazes
└── dom.js           Criação segura de elementos HTML
```

## Testes

```bash
./mvnw test
```

```bash
node src/test/js/catalogo.test.mjs
```

## Entrega da atividade

- [Prompt utilizado para gerar o frontend](docs/PROMPT.md)
- [Guia da apresentação individual](docs/APRESENTACAO.md)
