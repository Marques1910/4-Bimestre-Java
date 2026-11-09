import { filmesApi } from "./api.js";
import { agruparPorGenero, cartazDe, destaqueDe, filtrarFilmes } from "./catalogo.js";
import { criarElemento } from "./dom.js";

// =========================
// ESTADO E ELEMENTOS
// =========================

const ESPERA_PESQUISA_MS = 350;
const CAMPOS_DO_FILME = ["titulo", "diretor", "genero", "anoLancamento", "capaUrl", "sinopse"];

let filmes = [];
let filmeAberto = null;
let exclusaoArmada = false;
let temporizadorRecado;
let temporizadorPesquisa;
let pesquisaAtual = 0;

const $ = (id) => document.getElementById(id);

const acervo = $("acervo");
const busca = $("busca");
const destaque = $("destaque");
const estojo = $("estojo");
const painel = $("painel");
const formulario = $("formulario");
const erroPainel = $("erroPainel");
const botaoSalvar = $("salvarFilme");
const botaoExcluir = $("excluirFilme");
const campoTitulo = $("campoTitulo");
const sugestoes = $("sugestoes");
const sugestoesAviso = $("sugestoesAviso");


// =========================
// CAPAS
// =========================

function criarCartazGerado(filme) {
    const { paleta, figura } = cartazDe(filme.titulo);
    const cartaz = criarElemento("span", `cartaz paleta-${paleta}`);

    cartaz.append(
        criarElemento("span", `cartaz-figura figura-${figura}`),
        criarElemento("span", "cartaz-titulo", filme.titulo),
    );

    return cartaz;
}

function criarCapa(filme) {
    if (!filme.capaUrl) {
        return criarCartazGerado(filme);
    }

    const imagem = criarElemento("img", "capa");
    imagem.alt = "";
    imagem.src = filme.capaUrl;
    imagem.addEventListener("error", () => imagem.replaceWith(criarCartazGerado(filme)));

    return imagem;
}


// =========================
// ACERVO
// =========================

function criarCard(filme) {
    const card = criarElemento("button", "card");
    card.type = "button";
    card.setAttribute("aria-label", `Abrir ${filme.titulo}`);
    card.addEventListener("click", () => abrirFilme(filme.id));

    const moldura = criarElemento("span", "card-capa");
    moldura.append(criarCapa(filme));

    const legenda = criarElemento("span", "card-legenda");
    legenda.append(
        criarElemento("span", "", filme.anoLancamento ?? "Sem ano"),
        criarElemento("span", "", `ID ${filme.id}`),
    );

    card.append(moldura, criarElemento("span", "card-titulo", filme.titulo), legenda);

    const item = document.createElement("li");
    item.append(card);
    return item;
}

function criarPrateleira({ genero, filmes: filmesDaPrateleira }, emGrade) {
    const prateleira = criarElemento("section", "prateleira");
    const fileira = criarElemento("ul", emGrade ? "fileira fileira-grade" : "fileira");

    fileira.append(...filmesDaPrateleira.map(criarCard));
    prateleira.append(criarElemento("h2", "", genero), fileira);

    return prateleira;
}

function desenharDestaque(filme) {
    destaque.hidden = !filme;

    if (!filme) {
        return;
    }

    const texto = criarElemento("div", "destaque-texto");
    const dados = criarElemento("p", "estojo-dados");
    preencherDados(dados, filme);

    const botao = criarElemento("button", "botao botao-principal", "Abrir capa");
    botao.type = "button";
    botao.addEventListener("click", () => abrirFilme(filme.id));

    texto.append(
        criarElemento("h2", "", filme.titulo),
        dados,
        criarElemento("p", "destaque-sinopse", filme.sinopse ?? ""),
        botao,
    );

    const capa = criarElemento("div", "destaque-capa");
    capa.append(criarCapa(filme));

    destaque.replaceChildren(texto, capa);

    if (filme.capaUrl) {
        const fundo = criarElemento("img", "destaque-fundo");
        fundo.alt = "";
        fundo.src = filme.capaUrl;
        destaque.prepend(fundo);
    }
}

function mostrarAviso(texto, rotuloAcao, acao) {
    $("avisoTexto").textContent = texto;
    $("avisoAcao").textContent = rotuloAcao;
    $("avisoAcao").onclick = acao;
    $("aviso").hidden = false;
}

function desenharAcervo() {
    const termo = busca.value.trim();
    const visiveis = filtrarFilmes(filmes, termo);
    const prateleiras = termo
        ? [{ genero: "Resultados da busca", filmes: visiveis }]
        : agruparPorGenero(filmes);

    desenharDestaque(termo ? null : destaqueDe(filmes));
    acervo.replaceChildren(...(visiveis.length ? prateleiras.map((p) => criarPrateleira(p, Boolean(termo))) : []));
    $("contagem").textContent = filmes.length === 1 ? "1 filme" : `${filmes.length} filmes`;
    $("aviso").hidden = true;

    if (filmes.length === 0) {
        mostrarAviso("Nenhum filme cadastrado.", "Cadastrar primeiro filme", () => abrirPainel());
    } else if (visiveis.length === 0) {
        mostrarAviso(`Nenhum filme encontrado para "${termo}".`, "Limpar busca", () => {
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
        destaque.hidden = true;
        $("contagem").textContent = "";
        mostrarAviso(`${erro.message} Verifique se a aplicação está rodando.`, "Tentar novamente", carregarAcervo);
    }
}


// =========================
// CAPA ABERTA COM AS INFORMAÇÕES
// =========================

function preencherDados(elemento, filme) {
    elemento.replaceChildren(
        criarElemento("span", "", filme.anoLancamento ?? "Sem ano"),
        criarElemento("span", "", filme.genero ?? "Sem gênero"),
        criarElemento("span", "", `ID ${filme.id}`),
    );
}

function abrirEstojo(filme) {
    filmeAberto = filme;

    // Duas faces: a frente aparece fechada e o verso depois que a folha gira
    $("folha").replaceChildren(criarCapa(filme), criarCapa(filme));
    $("estojoTitulo").textContent = filme.titulo;
    preencherDados($("estojoDados"), filme);
    $("estojoDiretor").textContent = filme.diretor ? `Direção de ${filme.diretor}` : "";
    $("estojoSinopse").textContent = filme.sinopse || "Este filme ainda não tem sinopse.";

    estojo.showModal();
}

// Busca no backend para mostrar o dado atual, mesmo que a tela esteja desatualizada
async function abrirFilme(id) {
    try {
        abrirEstojo(await filmesApi.buscar(id));
    } catch (erro) {
        mostrarRecado(erro.message, true);
        await carregarAcervo();
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

function preencherFormulario(filme) {
    for (const campo of CAMPOS_DO_FILME) {
        formulario.elements[campo].value = filme[campo] ?? "";
    }
}

function abrirPainel(filme = null) {
    filmeAberto = filme;
    formulario.reset();
    erroPainel.hidden = true;
    limparSugestoes();
    desarmarExclusao();

    $("painelTitulo").textContent = filme ? `Editar filme ${filme.id}` : "Novo filme";
    botaoSalvar.textContent = filme ? "Salvar alterações" : "Cadastrar filme";
    botaoExcluir.hidden = !filme;

    if (filme) {
        preencherFormulario(filme);
    }

    painel.showModal();
}

function lerFormulario() {
    const dados = Object.fromEntries(new FormData(formulario));

    // Texto vazio (e não null) permite apagar capa e sinopse já gravadas
    return {
        titulo: dados.titulo.trim(),
        diretor: dados.diretor.trim(),
        genero: dados.genero.trim(),
        anoLancamento: Number(dados.anoLancamento),
        capaUrl: dados.capaUrl.trim(),
        sinopse: dados.sinopse.trim(),
    };
}

function mostrarRecado(texto, ehErro = false) {
    const recado = $("recado");

    recado.textContent = texto;
    recado.classList.toggle("recado-erro", ehErro);
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
// BUSCA AUTOMÁTICA DE FILMES
// =========================

function limparSugestoes() {
    // Mudar o número faz respostas antigas serem ignoradas ao chegar
    pesquisaAtual++;
    clearTimeout(temporizadorPesquisa);
    sugestoes.replaceChildren();
    sugestoesAviso.hidden = true;
}

function avisarFalhaNaPesquisa(erro) {
    sugestoesAviso.textContent = `${erro.message} Preencha os campos manualmente.`;
    sugestoesAviso.hidden = false;
}

async function aplicarSugestao(sugestao) {
    limparSugestoes();

    try {
        preencherFormulario(await filmesApi.detalharPesquisa(sugestao.tmdbId));
    } catch (erro) {
        avisarFalhaNaPesquisa(erro);
    }
}

function criarSugestao(sugestao) {
    const botao = criarElemento("button", "sugestao");
    botao.type = "button";
    botao.addEventListener("click", () => aplicarSugestao(sugestao));

    if (sugestao.capaUrl) {
        const capa = criarElemento("img", "sugestao-capa");
        capa.alt = "";
        capa.src = sugestao.capaUrl;
        botao.append(capa);
    } else {
        botao.append(criarElemento("span", "sugestao-capa"));
    }

    botao.append(
        criarElemento("span", "sugestao-titulo", sugestao.titulo),
        criarElemento("span", "sugestao-ano", sugestao.anoLancamento ?? "Sem ano"),
    );

    const item = document.createElement("li");
    item.append(botao);
    return item;
}

function agendarPesquisa() {
    limparSugestoes();

    const termo = campoTitulo.value.trim();
    const pesquisa = pesquisaAtual;

    if (termo.length < 2) {
        return;
    }

    temporizadorPesquisa = setTimeout(async () => {
        try {
            const encontrados = await filmesApi.pesquisar(termo);

            if (pesquisa === pesquisaAtual) {
                sugestoes.replaceChildren(...encontrados.map(criarSugestao));
            }
        } catch (erro) {
            if (pesquisa === pesquisaAtual) {
                avisarFalhaNaPesquisa(erro);
            }
        }
    }, ESPERA_PESQUISA_MS);
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
campoTitulo.addEventListener("input", agendarPesquisa);
$("novoFilme").addEventListener("click", () => abrirPainel());
$("fecharPainel").addEventListener("click", () => painel.close());
$("fecharEstojo").addEventListener("click", () => estojo.close());

$("editarFilme").addEventListener("click", () => {
    estojo.close();
    abrirPainel(filmeAberto);
});

// Clique fora do conteúdo cai no próprio <dialog>, que é o fundo escurecido
for (const janela of [painel, estojo]) {
    janela.addEventListener("click", (evento) => {
        if (evento.target === janela) {
            janela.close();
        }
    });
}

carregarAcervo();
