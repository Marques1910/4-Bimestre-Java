import { cartazDe, filtrarFilmes } from "./catalogo.js";

// =========================
// COMUNICAÇÃO COM A API
// =========================

const filmesApi = {
    listar: () => requisitar("/filmes"),

    salvar: (filme, id) => requisitar(id ? `/filmes/${id}` : "/filmes", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filme),
    }),

    excluir: (id) => requisitar(`/filmes/${id}`, { method: "DELETE" }),
};

async function requisitar(url, opcoes) {
    let resposta;

    try {
        resposta = await fetch(url, opcoes);
    } catch {
        throw new Error("Não foi possível conectar ao servidor.");
    }

    if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        throw new Error(dados.message || "O servidor recusou a operação.");
    }

    return resposta.status === 204 ? null : resposta.json();
}


// =========================
// ESTADO E ELEMENTOS
// =========================

let filmes = [];
let filmeAberto = null;
let exclusaoArmada = false;
let temporizadorRecado;

const $ = (id) => document.getElementById(id);

const acervo = $("acervo");
const busca = $("busca");
const painel = $("painel");
const formulario = $("formulario");
const erroPainel = $("erroPainel");
const botaoSalvar = $("salvarFilme");
const botaoExcluir = $("excluirFilme");


// =========================
// ACERVO
// =========================

function criarElemento(tag, classe, texto = "") {
    const elemento = document.createElement(tag);
    elemento.className = classe;
    elemento.textContent = texto;
    return elemento;
}

function criarCartaz(filme) {
    const { paleta, figura } = cartazDe(filme.titulo);

    const cartaz = criarElemento("button", `cartaz paleta-${paleta}`);
    cartaz.type = "button";
    cartaz.setAttribute("aria-label", `Editar ${filme.titulo}`);
    cartaz.addEventListener("click", () => abrirPainel(filme));

    const rodape = criarElemento("span", "cartaz-rodape");
    rodape.append(
        criarElemento("span", "", filme.anoLancamento ?? "Sem ano"),
        criarElemento("span", "", `ID ${filme.id}`),
    );

    cartaz.append(
        criarElemento("span", `cartaz-figura figura-${figura}`),
        criarElemento("span", "cartaz-titulo", filme.titulo),
        criarElemento("span", "cartaz-linha", filme.diretor ?? ""),
        criarElemento("span", "cartaz-linha", filme.genero ?? ""),
        rodape,
    );

    const item = document.createElement("li");
    item.append(cartaz);
    return item;
}

function mostrarAviso(texto, rotuloAcao, acao) {
    $("avisoTexto").textContent = texto;
    $("avisoAcao").textContent = rotuloAcao;
    $("avisoAcao").onclick = acao;
    $("aviso").hidden = false;
}

function desenharAcervo() {
    const visiveis = filtrarFilmes(filmes, busca.value);

    acervo.replaceChildren(...visiveis.map(criarCartaz));
    $("contagem").textContent = filmes.length === 1 ? "1 filme" : `${filmes.length} filmes`;
    $("aviso").hidden = true;

    if (filmes.length === 0) {
        mostrarAviso("Nenhum filme cadastrado.", "Cadastrar primeiro filme", () => abrirPainel());
    } else if (visiveis.length === 0) {
        mostrarAviso(`Nenhum filme encontrado para "${busca.value.trim()}".`, "Limpar busca", () => {
            busca.value = "";
            desenharAcervo();
            busca.focus();
        });
    }
}

async function carregarAcervo() {
    try {
        filmes = await filmesApi.listar();
        desenharAcervo();
    } catch (erro) {
        acervo.replaceChildren();
        $("contagem").textContent = "";
        mostrarAviso(`${erro.message} Verifique se a aplicação está rodando.`, "Tentar novamente", carregarAcervo);
    }
}


// =========================
// PAINEL DE CADASTRO E EDIÇÃO
// =========================

function desarmarExclusao() {
    exclusaoArmada = false;
    botaoExcluir.textContent = "Excluir filme";
}

function mostrarErro(mensagem) {
    erroPainel.textContent = mensagem;
    erroPainel.hidden = false;
}

function abrirPainel(filme = null) {
    filmeAberto = filme;
    formulario.reset();
    erroPainel.hidden = true;
    desarmarExclusao();

    $("painelTitulo").textContent = filme ? `Editar filme ${filme.id}` : "Novo filme";
    botaoSalvar.textContent = filme ? "Salvar alterações" : "Cadastrar filme";
    botaoExcluir.hidden = !filme;

    if (filme) {
        for (const campo of ["titulo", "diretor", "genero", "anoLancamento"]) {
            formulario.elements[campo].value = filme[campo] ?? "";
        }
    }

    painel.showModal();
}

function lerFormulario() {
    const { titulo, diretor, genero, anoLancamento } = Object.fromEntries(new FormData(formulario));

    return {
        titulo: titulo.trim(),
        diretor: diretor.trim(),
        genero: genero.trim(),
        anoLancamento: Number(anoLancamento),
    };
}

function mostrarRecado(texto) {
    const recado = $("recado");

    recado.textContent = texto;
    recado.hidden = false;

    clearTimeout(temporizadorRecado);
    temporizadorRecado = setTimeout(() => { recado.hidden = true; }, 3000);
}

async function executarNoPainel(operacao, recado) {
    erroPainel.hidden = true;
    botaoSalvar.disabled = botaoExcluir.disabled = true;

    try {
        await operacao();
        await carregarAcervo();
        painel.close();
        mostrarRecado(recado);
    } catch (erro) {
        mostrarErro(erro.message);
    } finally {
        botaoSalvar.disabled = botaoExcluir.disabled = false;
    }
}


// =========================
// EVENTOS
// =========================

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const id = filmeAberto?.id;

    executarNoPainel(
        () => filmesApi.salvar(lerFormulario(), id),
        id ? "Alterações salvas." : "Filme cadastrado.",
    );
});

botaoExcluir.addEventListener("click", () => {
    if (!exclusaoArmada) {
        exclusaoArmada = true;
        botaoExcluir.textContent = "Confirmar exclusão";
        return;
    }

    desarmarExclusao();
    executarNoPainel(() => filmesApi.excluir(filmeAberto.id), "Filme excluído.");
});

botaoExcluir.addEventListener("blur", desarmarExclusao);
busca.addEventListener("input", desenharAcervo);
$("novoFilme").addEventListener("click", () => abrirPainel());
$("fecharPainel").addEventListener("click", () => painel.close());

// Clique fora do formulário cai no próprio <dialog>, que é o fundo escurecido
painel.addEventListener("click", (evento) => {
    if (evento.target === painel) {
        painel.close();
    }
});

carregarAcervo();
