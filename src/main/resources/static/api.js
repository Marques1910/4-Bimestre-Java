import { registrarRequisicao } from "./monitor.js";

// Único ponto do frontend que conversa com o backend Java
export const filmesApi = {
    listar: () => requisitar("/filmes"),

    buscar: (id) => requisitar(`/filmes/${id}`),

    salvar: (filme, id) => requisitar(id ? `/filmes/${id}` : "/filmes", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filme),
    }),

    excluir: (id) => requisitar(`/filmes/${id}`, { method: "DELETE" }),

    pesquisar: (termo) => requisitar(`/filmes/pesquisa?termo=${encodeURIComponent(termo)}`),

    detalharPesquisa: (tmdbId) => requisitar(`/filmes/pesquisa/${tmdbId}`),
};

function lerJson(texto) {
    try {
        return JSON.parse(texto);
    } catch {
        return null;
    }
}

async function requisitar(url, opcoes = {}) {
    const inicio = performance.now();

    const registro = {
        metodo: opcoes.method ?? "GET",
        url,
        enviado: opcoes.body ? JSON.parse(opcoes.body) : null,
    };

    const concluir = (status, recebido) => registrarRequisicao({
        ...registro,
        status,
        recebido,
        duracao: Math.round(performance.now() - inicio),
    });

    let resposta;

    try {
        resposta = await fetch(url, opcoes);
    } catch {
        concluir(null, null);
        throw new Error("Não foi possível conectar ao servidor.");
    }

    const dados = lerJson(await resposta.text());
    concluir(resposta.status, dados);

    if (!resposta.ok) {
        throw new Error(dados?.message || "O servidor recusou a operação.");
    }

    return dados;
}
