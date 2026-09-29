const api = "/filmes";


// =========================
// CRIAR FILME
// =========================

async function criar() {

    const titulo = document.getElementById("titulo").value.trim();
    const diretor = document.getElementById("diretor").value.trim();
    const genero = document.getElementById("genero").value.trim();
    const anoLancamento = document.getElementById("anoLancamento").value;

    if (titulo === "" || diretor === "") {

        alert("Preencha o título e o diretor!");

        return;
    }

    const filme = {
        titulo: titulo,
        diretor: diretor,
        genero: genero,
        anoLancamento: anoLancamento
            ? Number(anoLancamento)
            : null
    };

    try {

        const resp = await fetch(api, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(filme)

        });

        if (resp.ok) {

            alert("Filme cadastrado com sucesso!");

            limparCadastro();

        } else {

            const mensagem = await tratarErro(resp);

            alert("Erro ao cadastrar filme: " + mensagem);

        }

    } catch (erro) {

        console.error("Erro:", erro);

        alert("Erro ao conectar com o servidor.");

    }

}


// =========================
// BUSCAR FILME
// =========================

async function buscar() {

    const id = document.getElementById("buscarId").value;

    const resultado = document.getElementById("resultadoBuscar");

    resultado.innerHTML = "";

    if (id === "") {

        alert("Digite o ID do filme!");

        return;
    }

    try {

        const resp = await fetch(`${api}/${id}`);

        if (resp.ok) {

            const filme = await resp.json();

            mostrarFilme(filme);

        } else {

            resultado.innerHTML = `
                <p>Filme não encontrado!</p>
            `;

        }

    } catch (erro) {

        console.error("Erro:", erro);

        resultado.innerHTML = `
            <p>Erro ao buscar o filme.</p>
        `;

    }

}


// =========================
// MOSTRAR FILME
// =========================

function mostrarFilme(filme) {

    const resultado = document.getElementById("resultadoBuscar");

    resultado.innerHTML = `
        <p><strong>ID:</strong> ${filme.id ?? "Não informado"}</p>

        <p>
            <strong>Título:</strong>
            ${filme.titulo ?? "Não informado"}
        </p>

        <p>
            <strong>Diretor:</strong>
            ${filme.diretor ?? "Não informado"}
        </p>

        <p>
            <strong>Gênero:</strong>
            ${filme.genero ?? "Não informado"}
        </p>

        <p>
            <strong>Ano:</strong>
            ${filme.anoLancamento ?? "Não informado"}
        </p>
    `;

}


// =========================
// DELETAR FILME
// =========================

async function deletar() {

    const id = document.getElementById("deletarId").value;

    if (id === "") {

        alert("Digite o ID do filme!");

        return;
    }

    const confirmar = confirm(
        "Deseja realmente excluir este filme?"
    );

    if (!confirmar) {

        return;
    }

    try {

        const resp = await fetch(
            `${api}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (resp.ok) {

            alert("Filme deletado com sucesso!");

            document.getElementById("deletarId").value = "";

        } else {

            const mensagem = await tratarErro(resp);

            alert("Erro ao deletar filme: " + mensagem);

        }

    } catch (erro) {

        console.error("Erro:", erro);

        alert("Erro ao conectar com o servidor.");

    }

}


// =========================
// ATUALIZAR FILME
// =========================

async function atualizar() {

    const id = document.getElementById("id").value;

    const titulo =
        document.getElementById("novoTitulo").value.trim();

    const diretor =
        document.getElementById("novoDiretor").value.trim();

    const genero =
        document.getElementById("novoGenero").value.trim();

    const anoLancamento =
        document.getElementById("novoAnoLancamento").value;

    if (id === "") {

        alert("Digite o ID do filme!");

        return;
    }

    const filme = {
        titulo: titulo,
        diretor: diretor,
        genero: genero,
        anoLancamento: anoLancamento
            ? Number(anoLancamento)
            : null
    };

    try {

        const resp = await fetch(
            `${api}/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(filme)

            }
        );

        if (resp.ok) {

            alert("Filme atualizado com sucesso!");

            limparAtualizacao();

        } else {

            const mensagem = await tratarErro(resp);

            alert("Erro ao atualizar filme: " + mensagem);

        }

    } catch (erro) {

        console.error("Erro:", erro);

        alert("Erro ao conectar com o servidor.");

    }

}


// =========================
// TRATAR ERRO DA API
// =========================

async function tratarErro(resp) {

    try {

        const dados = await resp.json();

        if (dados.message) {
            return dados.message;
        }

        if (dados.mensagem) {
            return dados.mensagem;
        }

        if (dados.erro) {
            return dados.erro;
        }

        return "Erro na requisição.";

    } catch {

        return "Erro na requisição.";

    }

}


// =========================
// LIMPAR CADASTRO
// =========================

function limparCadastro() {

    document.getElementById("titulo").value = "";
    document.getElementById("diretor").value = "";
    document.getElementById("genero").value = "";
    document.getElementById("anoLancamento").value = "";

}


// =========================
// LIMPAR ATUALIZAÇÃO
// =========================

function limparAtualizacao() {

    document.getElementById("id").value = "";
    document.getElementById("novoTitulo").value = "";
    document.getElementById("novoDiretor").value = "";
    document.getElementById("novoGenero").value = "";
    document.getElementById("novoAnoLancamento").value = "";

}